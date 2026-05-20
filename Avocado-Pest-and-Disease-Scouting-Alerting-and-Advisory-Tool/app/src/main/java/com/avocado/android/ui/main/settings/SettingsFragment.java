package com.avocado.android.ui.main.settings;

import android.Manifest;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;

import com.androidnetworking.AndroidNetworking;
import com.androidnetworking.common.Priority;
import com.androidnetworking.error.ANError;
import com.androidnetworking.interfaces.JSONObjectRequestListener;
import com.avocado.android.R;
import com.avocado.android.databinding.FragmentMainSettingsBinding;
import com.avocado.android.ui.main.settings.dialogs.EditProfileBottomSheetDialog;
import com.avocado.android.ui.main.settings.dialogs.TakePhotoBottomSheetDialog;
import com.avocado.android.ui.manageblocks.ManageBlocksActivity;
import com.avocado.android.ui.managefarms.ManageFarmsActivity;
import com.avocado.android.ui.start.StartActivity;
import com.avocado.android.ui.views.PhotoFileView;
import com.avocado.android.ui.views.ProgressDialog;
import com.avocado.android.utils.Constants;
import com.avocado.android.utils.FileManager;
import com.avocado.android.utils.TokenManager;
import com.bumptech.glide.Glide;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.IOException;

public class SettingsFragment extends Fragment implements EditProfileBottomSheetDialog.OnSaveListener, TakePhotoBottomSheetDialog.OnPhotoListener {

    private FragmentMainSettingsBinding binding;
    private EditProfileBottomSheetDialog editProfileBottomSheetDialog;
    private TakePhotoBottomSheetDialog takePhotoBottomSheetDialog;
    private ProgressDialog progressDialog;

    private ActivityResultLauncher<Intent> photoPickerLauncher;
    private ActivityResultLauncher<String> photoPermissionLauncher;
    private Uri cameraImageUri;
    private Uri resultUri;

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        SettingsViewModel settingsViewModel =
                new ViewModelProvider(requireActivity()).get(SettingsViewModel.class);

        binding = FragmentMainSettingsBinding.inflate(inflater, container, false);
        editProfileBottomSheetDialog = new EditProfileBottomSheetDialog();
        takePhotoBottomSheetDialog = new TakePhotoBottomSheetDialog();
        progressDialog = ProgressDialog.create(requireContext(), "Loading...");
        View root = binding.getRoot();

        editProfileBottomSheetDialog.setOnSaveListener(this);
        takePhotoBottomSheetDialog.setOnPhotoListener(this);

        binding.fragmentMainSettingsNameTextView.setText(getName());
        binding.fragmentMainSettingsLocationTextView.setText(getLocation());
        binding.fragmentMainSettingsPhoneNumberTextView.setText(getPhoneNumber());

        return root;
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        checkTokenExpired();

        setProfilePicture();
        observeViewModel();
        setupListeners(view);
        setupPhotoPicker();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }

    @Override
    public void onSave(String firstName, String lastName, String location, String phoneNumber) {
        progressDialog.show();
        updateUserData(firstName, lastName, location, phoneNumber);
    }

    @Override
    public void onPickPhoto() {
        takePhotoBottomSheetDialog.dismiss();
        pickPhoto();
    }

    private void setProfilePicture() {
        TokenManager tokenManager = new TokenManager(requireContext());
        String profilePicture = tokenManager.getProfilePicture();

        if (profilePicture != null && !profilePicture.isEmpty())
            binding.fragmentMainSettingsAccountImageButton.setPadding(0, 0, 0, 0);

        Glide.with(requireContext())
                .load(profilePicture)
                .placeholder(R.drawable.ic_farmer)
                .circleCrop()
                .into(binding.fragmentMainSettingsAccountImageButton);
    }

    private void observeViewModel() {

    }

    private void setupListeners(View view) {
        binding.fragmentMainSettingsAccountImageButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Bundle args = new Bundle();
                args.putString("title", "Profile Picture");
                args.putString("subTitle", "Take photo of the profile picture");

                takePhotoBottomSheetDialog.setArguments(args);
                takePhotoBottomSheetDialog.show(getChildFragmentManager(), "TakePhotoBottomSheetDialog");
            }
        });

        binding.fragmentMainSettingsEditTextView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Bundle args = new Bundle();
                args.putString("firstName", getFirstName());
                args.putString("lastName", getLastName());
                args.putString("location", getLocation());
                args.putString("phoneNumber", getPhoneNumber());

                editProfileBottomSheetDialog.setArguments(args);
                editProfileBottomSheetDialog.show(getChildFragmentManager(), "EditProfileBottomSheetDialog");
            }
        });

        binding.fragmentMainSettingsManageFarmsLinearLayout.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(getActivity(), ManageFarmsActivity.class);
                startActivity(intent);
            }
        });

        binding.fragmentMainSettingsManageBlocksLinearLayout.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(getActivity(), ManageBlocksActivity.class);
                startActivity(intent);
            }
        });

        binding.fragmentMainSettingsLogOutButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                clearTokens();
                clearUserData();

                Intent intent = new Intent(getActivity(), StartActivity.class);
                startActivity(intent);
                requireActivity().finish();
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
            if (resultUri != null) {
                binding.fragmentMainSettingsAccountImageButton.setPadding(0, 0, 0, 0);

                Glide.with(requireContext())
                        .load(resultUri)
                        .placeholder(R.drawable.ic_farmer)
                        .circleCrop()
                        .into(binding.fragmentMainSettingsAccountImageButton);

                showAlertDialog();
            } else {
                Toast.makeText(requireContext(), "No photo selected", Toast.LENGTH_SHORT).show();
            }
        } catch (Exception e) {
            Log.d("TakePhotoBottomSheetDialog", "Error saving photo");
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
        Intent chooser = Intent.createChooser(getGalleryIntent(), "Select Photo");
        chooser.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Intent[]{getCameraIntent()});
        photoPickerLauncher.launch(chooser);
    }

    private void openImage(Uri imageUri) {
        if (imageUri == null) return;

        Context context = getContext();

        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setDataAndType(imageUri, "image/*");
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        try {
            startActivity(intent);
        } catch (ActivityNotFoundException e) {
            Toast.makeText(context, "No app found to open image", Toast.LENGTH_SHORT).show();
        }
    }

    private String getName() {
        TokenManager tokenManager = new TokenManager(requireContext());
        return tokenManager.getFirstName() + " " + tokenManager.getLastName();
    }

    private String getFirstName() {
        TokenManager tokenManager = new TokenManager(requireContext());
        return tokenManager.getFirstName();
    }

    private String getLastName() {
        TokenManager tokenManager = new TokenManager(requireContext());
        return tokenManager.getLastName();
    }

    private String getLocation() {
        TokenManager tokenManager = new TokenManager(requireContext());
        return tokenManager.getCounty();
    }

    private String getPhoneNumber() {
        TokenManager tokenManager = new TokenManager(requireContext());
        return tokenManager.getPhoneNumber();
    }

    private void clearTokens() {
        TokenManager tokenManager = new TokenManager(requireContext());
        tokenManager.clearTokens();
    }

    private void clearUserData() {
        TokenManager tokenManager = new TokenManager(requireContext());
        tokenManager.clearUserData();
    }

    private void showAlertDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(requireContext());
        builder.setTitle("Profile Picture");
        builder.setMessage("Do you want to update your profile picture?");
        builder.setPositiveButton("Yes", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialogInterface, int i) {
                dialogInterface.dismiss();

                if (resultUri.getPath() == null) return;

                try {
                    File imageFile = FileManager.getFileFromUri(requireContext(), resultUri, "profile_picture.jpg");
                    Log.d("SettingsFragment", imageFile.getAbsolutePath());

                    progressDialog.show();
                    uploadProfilePicture(imageFile);

                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }
        });

        builder.setNegativeButton("No", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialogInterface, int i) {
                dialogInterface.dismiss();
            }
        });

        AlertDialog dialog = builder.create();
        dialog.show();
    }

    private void checkTokenExpired() {
        TokenManager tokenManager = new TokenManager(requireContext());
        if (tokenManager.isTokenExpired()) {
            tokenManager.clearTokens();
            tokenManager.clearUserData();

            Intent intent = new Intent(getActivity(), StartActivity.class);
            startActivity(intent);
            requireActivity().finish();
        }
    }

    public void updateUserData(String firstName, String lastName, String location, String phoneNumber) {
        TokenManager tokenManager = new TokenManager(requireContext());
        String accessToken = tokenManager.getAccessToken();
        String userId = tokenManager.getUserId();

        JSONObject body = new JSONObject();
        try {
            body.put("phone_number", phoneNumber);
            body.put("county", location);
            body.put("first_name", firstName);
            body.put("last_name", lastName);
        } catch (JSONException e) {
            Log.e("updateUserData", e.toString());
            return;
        }

        AndroidNetworking.put(Constants.BASE_URL + Constants.UPDATE_USER_URL)
                .addHeaders("Authorization", "Bearer " + accessToken)
                .addHeaders("Content-Type", "application/json")
                .addPathParameter("id", userId)
                .addJSONObjectBody(body)
                .setPriority(Priority.HIGH)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        tokenManager.setFirstName(firstName);
                        tokenManager.setLastName(lastName);
                        tokenManager.setPhoneNumber(phoneNumber);
                        tokenManager.setCounty(location);

                        try {
                            tokenManager.setProfilePicture(response.getString("profile_picture"));
                        } catch (JSONException e) {
                            throw new RuntimeException(e);
                        }

                        setProfilePicture();
                        binding.fragmentMainSettingsNameTextView.setText(firstName + " " + lastName);
                        binding.fragmentMainSettingsLocationTextView.setText(location);
                        binding.fragmentMainSettingsPhoneNumberTextView.setText(phoneNumber);

                        progressDialog.dismiss();
                        Toast.makeText(requireContext(), "Updated successfully", Toast.LENGTH_SHORT).show();
                        Log.d("updateUserData", response.toString());
                    }

                    @Override
                    public void onError(ANError anError) {
                        progressDialog.dismiss();
                        Toast.makeText(requireContext(), "Failed to update", Toast.LENGTH_SHORT).show();
                        Log.d("updateUserData", anError.toString());
                        Log.d("updateUserData", anError.getErrorBody());
                        Log.d("updateUserData", anError.getErrorCode() + "");
                    }
                });
    }

    public void uploadProfilePicture(File imageFile) {
        TokenManager tokenManager = new TokenManager(requireContext());
        String accessToken = tokenManager.getAccessToken();

        AndroidNetworking.upload(Constants.BASE_URL + Constants.UPLOAD_PROFILE_PICTURE_URL)
                .addHeaders("Authorization", "Bearer " + accessToken)
                .addHeaders("Content-Type", "application/json")
                .addMultipartFile("profile_picture", imageFile)
                .setPriority(Priority.HIGH)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        try {
                            tokenManager.setProfilePicture(response.getString("profile_picture"));
                            setProfilePicture();
                        } catch (JSONException e) {
                            throw new RuntimeException(e);
                        }

                        progressDialog.dismiss();
                        Toast.makeText(requireContext(), "Profile picture updated successfully", Toast.LENGTH_SHORT).show();
                        Log.d("uploadProfilePicture", response.toString());
                    }

                    @Override
                    public void onError(ANError anError) {
                        progressDialog.dismiss();
                        Toast.makeText(requireContext(), "Failed to update profile picture", Toast.LENGTH_SHORT).show();
                        Log.d("uploadProfilePicture", anError.toString());
                        Log.d("uploadProfilePicture", anError.getErrorBody());
                        Log.d("uploadProfilePicture", anError.getErrorCode() + "");
                    }
                });
    }
}