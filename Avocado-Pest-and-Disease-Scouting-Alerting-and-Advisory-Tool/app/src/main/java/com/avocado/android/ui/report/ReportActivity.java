package com.avocado.android.ui.report;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Log;
import android.view.View;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;

import com.androidnetworking.AndroidNetworking;
import com.androidnetworking.common.Priority;
import com.androidnetworking.error.ANError;
import com.androidnetworking.interfaces.JSONObjectRequestListener;
import com.avocado.android.R;
import com.avocado.android.databinding.ActivityReportBinding;
import com.avocado.android.ui.views.PhotoFileView;
import com.avocado.android.ui.views.ProgressDialog;
import com.avocado.android.utils.Constants;
import com.avocado.android.utils.TokenManager;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.util.Arrays;
import java.util.List;

public class ReportActivity extends AppCompatActivity {

    private ActivityResultLauncher<Intent> photoPickerLauncher;
    private ActivityResultLauncher<String> photoPermissionLauncher;
    private Uri cameraImageUri;

    ActivityReportBinding binding;
    ProgressDialog progressDialog;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityReportBinding.inflate(getLayoutInflater());
        progressDialog = ProgressDialog.create(this, "Loading...");

        setContentView(binding.getRoot());

        binding.activityReportProblemTakeAPhotoRadioButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                pickPhoto();
            }
        });

        binding.activityReportSubmitReportButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                String problemType = binding.activityReportProblemRadioGroup.getCheckedRadioButtonText();
                String urgency = binding.activityReportUrgentRadioGroup.getCheckedRadioButtonText();
                String description = binding.activityReportProblemDescribeEditText.getText().toString();

                if (problemType.isEmpty()) {
                    Toast.makeText(getApplicationContext(), "Please select a problem type", Toast.LENGTH_SHORT).show();
                    return;
                }

                if (urgency.isEmpty()) {
                    Toast.makeText(getApplicationContext(), "Please select urgency", Toast.LENGTH_SHORT).show();
                    return;
                }

                if (description.isEmpty()) {
                    Toast.makeText(getApplicationContext(), "Please enter a description", Toast.LENGTH_SHORT).show();
                    return;
                }

                try {
                    JSONObject body = new JSONObject();
                    body.put("problem_type", problemType);
                    body.put("urgency", urgency);
                    body.put("photo", null);
                    body.put("description", description);

                    progressDialog.show();
                    postData(body);

                } catch (JSONException e) {
                    throw new RuntimeException(e);
                }
            }
        });

        setupPhotoPicker();
    }

    private void setupPhotoPicker() {

        photoPermissionLauncher = registerForActivityResult(
                new ActivityResultContracts.RequestPermission(), isGranted -> {
                    if (isGranted) {
                        launchPhotoChooser();
                    }
                });

        photoPickerLauncher = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (result.getResultCode() == Activity.RESULT_OK) {
                        handlePhotoResult(result.getData());
                    }
                }
        );
    }

    private void handlePhotoResult(Intent data) {
        Uri resultUri;

        if (data != null && data.getData() != null) {
            resultUri = data.getData();
            getContentResolver().takePersistableUriPermission(
                    resultUri,
                    Intent.FLAG_GRANT_READ_URI_PERMISSION
            );
        } else {
            resultUri = cameraImageUri;
        }

        try {
            PhotoFileView photoFileView = new PhotoFileView(getApplicationContext());
            photoFileView.setDescription("Photo taken of the problem");
            photoFileView.setImageUri(resultUri);
            photoFileView.setOnCancelClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    binding.activityReportProblemTakeAPhotoLinearLayout.removeView(photoFileView);
                }
            });

            binding.activityReportProblemTakeAPhotoLinearLayout.removeAllViews();
            binding.activityReportProblemTakeAPhotoLinearLayout.addView(photoFileView);

        } catch (Exception e) {
            Log.d("ReportActivity", "Error saving photo");
        }
    }

    private Uri createCameraImageUri() {
        File image = new File(getCacheDir(), "camera_" + System.currentTimeMillis() + ".jpg");
        return FileProvider.getUriForFile(this, getPackageName() + ".provider", image);
    }

    private Intent getCameraIntent() {
        cameraImageUri = createCameraImageUri();
        Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        intent.putExtra(MediaStore.EXTRA_OUTPUT, cameraImageUri);
        return intent;
    }

    private Intent getGalleryIntent() {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("image/*");
        return intent;
    }

    private void pickPhoto() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            launchPhotoChooser();
        } else {
            photoPermissionLauncher.launch(Manifest.permission.CAMERA);
        }
    }

    private void launchPhotoChooser() {
        // Intent chooser = Intent.createChooser(getGalleryIntent(), "Select Photo");
        // chooser.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Intent[]{getCameraIntent()});
        // photoPickerLauncher.launch(chooser);

        Intent cameraIntent = getCameraIntent();
        photoPickerLauncher.launch(cameraIntent);
    }

    private void postData(JSONObject body) throws JSONException {
        TokenManager tokenManager = new TokenManager(getApplicationContext());
        String accessToken = tokenManager.getAccessToken();

        AndroidNetworking.post(Constants.BASE_URL + Constants.POST_PROBLEM_REPORT_URL)
                .addHeaders("Authorization", "Bearer " + accessToken)
                .addHeaders("Content-Type", "application/json")
                .addJSONObjectBody(body)
                .setPriority(Priority.HIGH)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        progressDialog.dismiss();
                        Toast.makeText(getApplicationContext(), "Report submitted successfully", Toast.LENGTH_SHORT).show();
                        Log.d("ReportActivity Response", body.toString());
                        Log.d("ReportActivity Response", response.toString());
                        finish();
                    }

                    @Override
                    public void onError(ANError anError) {
                        progressDialog.dismiss();
                        Log.d("ReportActivity Response", body.toString());
                        Log.d("ReportActivity Response", anError.getErrorBody());
                        Log.d("ReportActivity Response", "" + anError.getErrorCode());
                    }
                });
    }
}