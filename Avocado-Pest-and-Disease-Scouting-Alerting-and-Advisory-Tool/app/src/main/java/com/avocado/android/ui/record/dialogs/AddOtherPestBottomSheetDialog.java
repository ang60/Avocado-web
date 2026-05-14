package com.avocado.android.ui.record.dialogs;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.text.TextUtils;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.avocado.android.databinding.DialogAddOtherPestBinding;
import com.avocado.android.ui.views.PhotoFileView;
import com.google.android.material.bottomsheet.BottomSheetDialogFragment;

import java.io.File;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;

public class AddOtherPestBottomSheetDialog extends BottomSheetDialogFragment {

    private ActivityResultLauncher<Intent> photoPickerLauncher;
    private ActivityResultLauncher<String> photoPermissionLauncher;
    private Uri cameraImageUri;
    private Uri imageUri;

    DialogAddOtherPestBinding binding;
    OnDialogListener listener;

    public AddOtherPestBottomSheetDialog() {}

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {

        binding = DialogAddOtherPestBinding.inflate(inflater, container, false);
        View root = binding.getRoot();

        return root;
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        setupListeners(view);
        setupPhotoPicker();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }

    private void setupListeners(View view) {
        binding.dialogAddNewTrapTakeTrapPhotoRadioButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                pickPhoto();
            }
        });

        binding.dialogAddNewTrapAddButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                String pestName = binding.dialogAddNewPestPestNameEditText.getText().toString();
                String numberOfPestsPerTrap = binding.dialogAddNewPestNumberPerTrapEditText.getText().toString();
                if (TextUtils.isEmpty(pestName) || TextUtils.isEmpty(numberOfPestsPerTrap))
                    return;

                dismiss();
                listener.onAddButtonClicked(imageUri, pestName, Integer.parseInt(numberOfPestsPerTrap));
            }
        });

        binding.dialogAddNewTrapCancelButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                dismiss();
            }
        });
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
            requireActivity().getContentResolver().takePersistableUriPermission(
                    resultUri,
                    Intent.FLAG_GRANT_READ_URI_PERMISSION
            );
        } else {
            resultUri = cameraImageUri;
        }

        try {
            PhotoFileView photoFileView = new PhotoFileView(requireContext());
            photoFileView.setDescription("Photo taken of the pest");
            photoFileView.setImageUri(resultUri);
            photoFileView.setOnCancelClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    binding.dialogAddNewTrapTakeTrapPhotoLinearLayout.removeView(photoFileView);
                }
            });

            binding.dialogAddNewTrapTakeTrapPhotoLinearLayout.removeAllViews();
            binding.dialogAddNewTrapTakeTrapPhotoLinearLayout.addView(photoFileView);

            imageUri = resultUri;

        } catch (Exception e) {
            Log.d("AddOtherPestBottomSheetDialog", "Error saving photo");
        }
    }

    private Uri createCameraImageUri() {
        File image = new File(requireActivity().getCacheDir(), "camera_" + System.currentTimeMillis() + ".jpg");
        return FileProvider.getUriForFile(requireContext(), requireActivity().getPackageName() + ".provider", image);
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
        if (ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
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

    public void setOnDialogListener(OnDialogListener listener) {
        this.listener = listener;
    }

    public interface OnDialogListener {
        void onAddButtonClicked(Uri imageUri, String pestName, int numberPerTrap);
    }
}
