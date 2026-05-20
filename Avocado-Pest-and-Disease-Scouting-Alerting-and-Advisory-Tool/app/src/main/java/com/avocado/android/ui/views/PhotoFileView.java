package com.avocado.android.ui.views;

import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.util.AttributeSet;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.avocado.android.R;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

import androidx.core.content.FileProvider;

import static androidx.core.content.ContentProviderCompat.requireContext;

public class PhotoFileView extends LinearLayout {

    private ImageView imageView;
    private ImageView cancelImageView;
    private TextView descriptionTextView;

    private Uri imageUri;
    private File imageFile;

    public PhotoFileView(Context context) {
        super(context);
        init(context);
    }

    public PhotoFileView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    public PhotoFileView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }

    private void init(Context context) {
        inflate(context, R.layout.file_photo_layout, this);

        setClickable(true);
        setFocusable(true);

        imageView = findViewById(R.id.file_photo_image);
        cancelImageView = findViewById(R.id.file_photo_cancel_image_view);
        descriptionTextView = findViewById(R.id.file_photo_description_text_view);

        // Handle whole view click → open image externally
        super.setOnClickListener(v -> openImage());
    }

    public void setDescription(String description) {
        descriptionTextView.setText(description);
    }

    public void setOnImageClickListener(OnClickListener listener) {
        imageView.setOnClickListener(listener);
    }

    public void setOnCancelClickListener(OnClickListener listener) {
        cancelImageView.setOnClickListener(listener);
    }

    public void setImageUri(Uri uri) {
        this.imageUri = uri;
    }

    public void setImageFile(File imageFile) {
        this.imageFile = imageFile;
    }

    private void openImage() {
        if (imageUri == null && imageFile == null) return;

        Context context = getContext();

        // Create URI using FileProvider
        Uri imageUri = FileProvider.getUriForFile(context,
                context.getPackageName() + ".provider", imageFile);

        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setDataAndType(imageUri, "image/*");
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        intent.setClipData(ClipData.newRawUri("", imageUri));

        try {
            context.startActivity(intent);
        } catch (ActivityNotFoundException e) {
            Toast.makeText(context, "No app found to open image", Toast.LENGTH_SHORT).show();
        }
    }
}