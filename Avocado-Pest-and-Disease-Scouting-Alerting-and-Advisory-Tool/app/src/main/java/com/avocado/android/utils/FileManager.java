package com.avocado.android.utils;

import android.Manifest;
import android.app.Activity;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.provider.OpenableColumns;
import android.util.JsonWriter;
import android.webkit.MimeTypeMap;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.URLConnection;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

public class FileManager {

    private FileManager() { }

    public static File[] getJsonFilesInDirectory(Context context, String directoryName) {
        File dir = new File(context.getFilesDir(), directoryName);

        if (!dir.exists() || !dir.isDirectory()) {
            return new File[0];
        }

        File[] files = dir.listFiles((file, name) -> name.endsWith(".json"));
        return files != null ? files : new File[0];
    }

    public static List<File> getJsonFilesInDirectoryAndSubdirectory(File directory) {
        List<File> files = new ArrayList<>();

        if (directory == null || !directory.exists()) return files;

        File[] children = directory.listFiles();
        if (children == null) return files;

        for (File child : children) {
            if (child.isDirectory()) {
                files.addAll(getJsonFilesInDirectoryAndSubdirectory(child));
            }
            else if (child.getName().toLowerCase().endsWith(".json")) {
                files.add(child);
            }
        }

        return files;
    }

    public static File getJsonFileInDirectory(Context context, String directoryName, String fileName) {
        File directory = new File(context.getFilesDir(), directoryName);

        if (!directory.exists() || !directory.isDirectory())
            return null;

        File file = new File(directory, fileName);

        return file.exists() && file.isFile() && file.getName().endsWith(".json") ? file : null;
    }

    public static String readJsonFromFile(File file) {
        if (file == null || !file.exists() || !file.isFile()) {
            return null;
        }

        StringBuilder json = new StringBuilder();

        try (
                FileInputStream fis = new FileInputStream(file);
                BufferedReader reader = new BufferedReader(new InputStreamReader(fis, StandardCharsets.UTF_8))
        ) {
            String line;
            while ((line = reader.readLine()) != null) {
                json.append(line);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return json.toString();
    }

    public static String readJsonFromFile(Context context, String directory, String fileName) {
        File file = getJsonFileInDirectory(context, directory, fileName);

        if (file == null || !file.exists() || !file.isFile()) {
            return null;
        }

        StringBuilder json = new StringBuilder();

        try (
                FileInputStream fis = new FileInputStream(file);
                BufferedReader reader = new BufferedReader(new InputStreamReader(fis, StandardCharsets.UTF_8))
        ) {
            String line;
            while ((line = reader.readLine()) != null) {
                json.append(line);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return json.toString();
    }

    public static void saveJson(Context context, String directory, String fileName, String jsonString) {
        File directoryFile = new File(context.getFilesDir(), directory);
        if (!directoryFile.exists()) {
            directoryFile.mkdirs();
        }

        File file = new File(directoryFile, fileName);

        // Uses try-with-resources to automatically close the BufferedWriter and OutputStreamWriter when done
        try (
                FileOutputStream fos = new FileOutputStream(file);
                BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(fos, StandardCharsets.UTF_8));
        ) {
            bw.write(jsonString);
            bw.flush();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void saveJsonToDownloads(Context context, Activity activity, String directory, String fileName, String jsonString) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                // ===== ANDROID 10+ (Scoped Storage) =====

                ContentResolver resolver = context.getContentResolver();

                // Delete existing file (avoid duplicates)
                String selection = MediaStore.MediaColumns.DISPLAY_NAME + "=? AND " + MediaStore.MediaColumns.RELATIVE_PATH + "=?";
                String[] args = new String[]{ fileName, Environment.DIRECTORY_DOWNLOADS + "/" + directory + "/" };
                resolver.delete(MediaStore.Downloads.EXTERNAL_CONTENT_URI, selection, args);

                ContentValues values = new ContentValues();
                values.put(MediaStore.MediaColumns.DISPLAY_NAME, fileName);
                values.put(MediaStore.MediaColumns.MIME_TYPE, "application/json");
                values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/" + directory);

                Uri uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                if (uri == null) return;

                try (OutputStream os = resolver.openOutputStream(uri)) {
                    if (os == null) return;
                    os.write(jsonString.getBytes(StandardCharsets.UTF_8));
                    os.flush();
                }

            } else {
                // ===== ANDROID 8–9 (API 26–28) =====

                if (!hasWritePermission(context)) {
                    requestPermission(activity);
                    return; // wait for permission callback
                }

                File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                File targetDir = new File(downloadsDir, directory);

                if (!targetDir.exists()) {
                    targetDir.mkdirs();
                }

                File file = new File(targetDir, fileName);

                try (FileOutputStream fos = new FileOutputStream(file, false)) {
                    fos.write(jsonString.getBytes(StandardCharsets.UTF_8));
                    fos.flush();
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void saveFileToDownloads(Context context, Activity activity, String directory, String fileName, File sourceFile) {

        try {
            if (!sourceFile.exists()) return;

            String mimeType = URLConnection.guessContentTypeFromName(fileName);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                // ===== ANDROID 10+ (Scoped Storage) =====

                ContentResolver resolver = context.getContentResolver();

                // Delete existing file (avoid duplicates)
                String selection = MediaStore.MediaColumns.DISPLAY_NAME + "=? AND " + MediaStore.MediaColumns.RELATIVE_PATH + "=?";
                String[] args = new String[]{ fileName, Environment.DIRECTORY_DOWNLOADS + "/" + directory + "/" };
                resolver.delete(MediaStore.Downloads.EXTERNAL_CONTENT_URI, selection, args);

                ContentValues values = new ContentValues();
                values.put(MediaStore.MediaColumns.DISPLAY_NAME, fileName);
                values.put(MediaStore.MediaColumns.MIME_TYPE, mimeType);
                values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/" + directory);

                Uri uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                if (uri == null) return;

                try (InputStream in = new FileInputStream(sourceFile);
                     OutputStream out = resolver.openOutputStream(uri)) {

                    if (out == null) return;

                    byte[] buffer = new byte[8192];
                    int len;
                    while ((len = in.read(buffer)) != -1) {
                        out.write(buffer, 0, len);
                    }
                    out.flush();
                }

            } else {
                // ===== ANDROID 8–9 (API 26–28) =====

                if (!hasWritePermission(context)) {
                    requestPermission(activity);
                    return;
                }

                File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                File targetDir = new File(downloadsDir, directory);

                if (!targetDir.exists()) {
                    targetDir.mkdirs();
                }

                File targetFile = new File(targetDir, fileName);

                try (InputStream in = new FileInputStream(sourceFile);
                     OutputStream out = new FileOutputStream(targetFile, false)) {

                    byte[] buffer = new byte[8192];
                    int len;
                    while ((len = in.read(buffer)) != -1) {
                        out.write(buffer, 0, len);
                    }
                    out.flush();
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    private static boolean hasWritePermission(Context context) {
        return ContextCompat.checkSelfPermission(context, Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED;
    }

    private static void requestPermission(Activity activity) {
        ActivityCompat.requestPermissions(activity, new String[]{ Manifest.permission.WRITE_EXTERNAL_STORAGE }, 100);
    }

    public static boolean deleteFile(File file) {
        if (file == null || !file.exists()) return false;
        return file.delete();
    }

    private static void writeJsonObject(JsonWriter writer, JsonObject object) throws Exception {
        writer.beginObject();
        for (Map.Entry<String, JsonElement> entry : object.entrySet()) {
            writer.name(entry.getKey());
            writeJsonElement(writer, entry.getValue());
        }
        writer.endObject();
    }

    private static void writeJsonArray(JsonWriter writer, JsonArray array) throws Exception {
        writer.beginArray();
        for (JsonElement element : array) {
            writeJsonElement(writer, element);
        }
        writer.endArray();
    }

    private static void writeJsonElement(JsonWriter writer, JsonElement element) throws Exception {
        if (element == null || element.isJsonNull()) {
            writer.nullValue();
        } else if (element.isJsonObject()) {
            writeJsonObject(writer, element.getAsJsonObject());
        } else if (element.isJsonArray()) {
            writeJsonArray(writer, element.getAsJsonArray());
        } else if (element.isJsonPrimitive()) {
            writeJsonPrimitive(writer, element.getAsJsonPrimitive());
        }
    }

    private static void writeJsonPrimitive(JsonWriter writer, JsonPrimitive primitive) throws Exception {
        if (primitive.isBoolean()) {
            writer.value(primitive.getAsBoolean());
        } else if (primitive.isNumber()) {
            writer.value(primitive.getAsNumber());
        } else if (primitive.isString()) {
            writer.value(primitive.getAsString());
        }
    }

    public static File saveImage(Context context, Uri imageUri, String directory, String fileName) throws IOException {

        String ext = getFileExtensionSafe(context, imageUri);
        if (ext == null) ext = "jpg";
        fileName = fileName + "." + ext;

        File dir = new File(context.getFilesDir(), directory);
        if (!dir.exists()) dir.mkdirs();

        File imageFile = new File(dir, fileName);

        try (
                InputStream is = context.getContentResolver().openInputStream(imageUri);
                OutputStream os = new FileOutputStream(imageFile, false); // overwrite existing file
        ) {
            copyStream(is, os);
        }

        return imageFile;
    }

    public static File saveAudio(Context context, Uri audioUri, String directory, String fileName) throws IOException {

        String ext = getFileExtensionSafe(context, audioUri);
        if (ext == null) ext = "mp3";
        fileName = fileName + "." + ext;

        File dir = new File(context.getFilesDir(), directory);
        if (!dir.exists()) dir.mkdirs();

        File audioFile = new File(dir, fileName);

        try (
                InputStream is = context.getContentResolver().openInputStream(audioUri);
                OutputStream os = new FileOutputStream(audioFile, false); // overwrite existing file
        ) {
            copyStream(is, os);
        }

        return audioFile;
    }

    public static File saveVideo(Context context, Uri videoUri, String directory, String fileName) throws IOException {

        String ext = getFileExtensionSafe(context, videoUri);
        if (ext == null) ext = "mp4";
        fileName = fileName + "." + ext;

        File dir = new File(context.getFilesDir(), directory);
        if (!dir.exists()) dir.mkdirs();

        File videoFile = new File(dir, fileName);

        try (
                InputStream is = context.getContentResolver().openInputStream(videoUri);
                OutputStream os = new FileOutputStream(videoFile, false); // overwrite existing file
        ) {
            copyStream(is, os);
        }

        return videoFile;
    }

    public static File saveFile(Context context, Uri fileUri, String directory, String fileName) throws IOException {

        String ext = getFileExtensionSafe(context, fileUri);
        if (ext == null) ext = "jpg";
        fileName = fileName + "." + ext;

        File dir = new File(context.getFilesDir(), directory);
        if (!dir.exists()) dir.mkdirs();

        File file = new File(dir, fileName);

        try (
                InputStream is = context.getContentResolver().openInputStream(fileUri);
                OutputStream os = new FileOutputStream(file, false); // overwrite existing file
        ) {
            copyStream(is, os);
        }

        return file;
    }

    public static File saveFile(Context context, File file, String directory, String fileName) throws IOException {

        File dir = new File(context.getFilesDir(), directory);
        if (!dir.exists()) dir.mkdirs();

        File _file = new File(dir, fileName);

        try (
                InputStream is = new FileInputStream(file);
                OutputStream os = new FileOutputStream(_file, false); // overwrite existing file
        ) {
            copyStream(is, os);
        }

        return _file;
    }

    private static void copyStream(InputStream is, OutputStream os) throws IOException {
        byte[] buffer = new byte[8192];
        int length;
        while ((length = is.read(buffer)) != -1) {
            os.write(buffer, 0, length);
        }
    }

    public static File getFile(Context context, String directory, String fileName) throws IOException {

        File file = new File(new File(context.getFilesDir(), directory), fileName);

        if (!file.exists() || !file.isFile())
            return null;

        return file;
    }

    private static String getFileExtension(Context context, Uri uri) {
        if (uri == null) return null;

        String extension = null;

        if (ContentResolver.SCHEME_CONTENT.equals(uri.getScheme())) {
            String mimeType = context.getContentResolver().getType(uri);
            if (mimeType != null) {
                extension = MimeTypeMap.getSingleton().getExtensionFromMimeType(mimeType);
            }
        } else if (ContentResolver.SCHEME_FILE.equals(uri.getScheme())) {
            extension = MimeTypeMap.getFileExtensionFromUrl(uri.toString());
        }

        return extension;
    }

    private static String getFileExtensionFromName(Context context, Uri uri) {
        String extension = null;

        Cursor cursor = context.getContentResolver().query(uri, new String[]{ OpenableColumns.DISPLAY_NAME }, null, null, null);

        if (cursor != null) {
            try {
                if (cursor.moveToFirst()) {
                    String name = cursor.getString(0);
                    int dot = name.lastIndexOf('.');
                    if (dot != -1) {
                        extension = name.substring(dot + 1);
                    }
                }
            } finally {
                cursor.close();
            }
        }

        return extension;
    }

    public static String getFileExtensionSafe(Context context, Uri uri) {
        String ext = getFileExtension(context, uri);

        if (ext == null || ext.isEmpty()) {
            ext = getFileExtensionFromName(context, uri);
        }

        return ext;
    }

    // Stream based file to bitmap
    public static Bitmap fileToBitmap(File file) throws IOException {
        try (InputStream is = new FileInputStream(file)) {
            return BitmapFactory.decodeStream(is);
        }
    }

    public static File getFileFromAsset(Context context, String assetFileName) {
        File file = new File(context.getCacheDir(), assetFileName); // Create a new file in cache directory

        try (InputStream is = context.getAssets().open(assetFileName);
             OutputStream os = new FileOutputStream(file)) {

            byte[] buffer = new byte[1024];
            int read;
            while ((read = is.read(buffer)) != -1) {
                os.write(buffer, 0, read);
            }
            // Flush and close streams (handled automatically by try-with-resources)

            return file;

        } catch (IOException e) {
            e.printStackTrace();

            return null;
        }
    }

    public static File getFileFromUri(Context context, Uri uri, String fileName) throws IOException {

        File tempFile = new File(context.getCacheDir(), fileName);

        InputStream inputStream = context.getContentResolver().openInputStream(uri);
        OutputStream outputStream = new FileOutputStream(tempFile);

        byte[] buffer = new byte[4096];
        int length;

        if (inputStream != null) {
            while ((length = inputStream.read(buffer)) > 0) {
                outputStream.write(buffer, 0, length);
            }
        }

        outputStream.flush();
        outputStream.close();

        if (inputStream != null) {
            inputStream.close();
        }

        return tempFile;
    }
}
