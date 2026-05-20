package com.avocado.android.ui.record;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.avocado.android.R;
import com.avocado.android.data.model.Data;
import com.avocado.android.data.model.PestsObserved;
import com.avocado.android.databinding.FragmentRecordStep4Binding;
import com.avocado.android.ui.audio.AudioRecorderActivity;
import com.avocado.android.ui.record.callback.OnAudioListener;
import com.avocado.android.ui.record.callback.OnPhotoListener;
import com.avocado.android.ui.record.callback.OnWriteListener;
import com.avocado.android.ui.record.dialogs.AddOtherPestBottomSheetDialog;
import com.avocado.android.ui.record.dialogs.IdontKnowBottomSheetDialog;
import com.avocado.android.ui.record.dialogs.IdontKnowWriteDownBottomSheetDialog;
import com.avocado.android.ui.record.dialogs.PestCountBottomSheetDialog;
import com.avocado.android.ui.views.AudioFileView;
import com.avocado.android.ui.views.AutoFitGridLayout;
import com.avocado.android.ui.views.CheckBox;
import com.avocado.android.ui.views.CheckBoxFour;
import com.avocado.android.ui.views.CheckBoxThree;
import com.avocado.android.ui.views.PhotoFileView;
import com.avocado.android.ui.views.RadioButton;
import com.avocado.android.ui.views.RadioGroup;
import com.avocado.android.ui.views.WriteDownFileView;
import com.avocado.android.utils.FileManager;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.Navigation;

import static android.app.Activity.RESULT_OK;

public class RecordStep4Fragment extends Fragment implements OnAudioListener, OnPhotoListener, OnWriteListener {

    private RecordsViewModel recordsViewModel;
    private FragmentRecordStep4Binding binding;

    private ActivityResultLauncher<Intent> photoPickerLauncher;
    private ActivityResultLauncher<String> photoPermissionLauncher;
    private ActivityResultLauncher<Intent> audioRecorderLauncher;
    private Uri cameraImageUri;

    private ActivityResultLauncher<Intent> audioPickerLauncher;
    private ActivityResultLauncher<String> audioPermissionLauncher;
    private Uri recordedAudioUri;

    private IdontKnowBottomSheetDialog idontKnowBottomSheetDialog;
    private IdontKnowWriteDownBottomSheetDialog idontKnowWriteDownBottomSheetDialog;

    private File dontKnowBeneficialInsectsObservedPhoto = null;

    public static RecordStep4Fragment newInstance() {
        return new RecordStep4Fragment();
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        // Activity-scoped Android ViewModel so all fragments inside the same activity share one ViewModel instance
        // requireActivity() returns the activity that created the fragment
        recordsViewModel = new ViewModelProvider(requireActivity()).get(RecordsViewModel.class);

        binding = FragmentRecordStep4Binding.inflate(inflater, container, false);
        idontKnowBottomSheetDialog = new IdontKnowBottomSheetDialog();
        idontKnowWriteDownBottomSheetDialog = new IdontKnowWriteDownBottomSheetDialog();

        idontKnowBottomSheetDialog.setOnAudioListener(this);
        idontKnowBottomSheetDialog.setOnPhotoListener(this);
        idontKnowBottomSheetDialog.setOnWriteListener(this);

        idontKnowWriteDownBottomSheetDialog.setOnWriteListener(this);

        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        observeViewModel();
        setupListeners(view);
        setupPhotoPicker();
        setupAudioPicker();
        restoreState();
    }

    private void observeViewModel() {

    }

    private void setupListeners(View view) {

        binding.fragmentRecordStep4BeneficialInsectsObservedIDontKnowRadioButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                idontKnowBottomSheetDialog.show(getChildFragmentManager(), "IdontKnowBottomSheetDialog");
            }
        });

        binding.fragmentRecordStep4BackButton.setOnClickListener(v ->
                {
                    setData();
                    Navigation.findNavController(v).popBackStack();
                }
        );

        binding.fragmentRecordStep4ContinueButton.setOnClickListener(v ->
                {
                    setData();
                    Navigation.findNavController(view).navigate(R.id.action_record_navigation_record_step_4_to_record_step_5_fragment);
                }
        );
    }

    private void restoreState() {
        if (recordsViewModel.data.beneficialInsectsObserved == null) return;

        for (String beneficialInsectsObserved : recordsViewModel.data.beneficialInsectsObserved) {
            AutoFitGridLayout autoFitGridLayout = binding.fragmentRecordStep4BeneficialInsectsObservedGridLayout;
            for (int i = 0; i < autoFitGridLayout.getChildCount(); i++) {
                CheckBoxFour checkBox = (CheckBoxFour) autoFitGridLayout.getChildAt(i);
                if (checkBox.getText().equalsIgnoreCase(beneficialInsectsObserved)) {
                    checkBox.setChecked(true);
                    break;
                }
            }
        }

        File dontKnowBeneficialInsectsObservedPhoto = recordsViewModel.data.dontKnowBeneficialInsectsObservedPhoto;
        if (dontKnowBeneficialInsectsObservedPhoto == null) return;

        addPhotoView(dontKnowBeneficialInsectsObservedPhoto);
    }

    private void setData() {
        recordsViewModel.data.beneficialInsectsObserved = getBeneficialInsectsObserved();
        recordsViewModel.data.dontKnowBeneficialInsectsObserved = false;
        recordsViewModel.data.dontKnowBeneficialInsectsObservedPhoto = null;
        recordsViewModel.data.dontKnowBeneficialInsectsObservedNote = "";
    }

    private List<String> getBeneficialInsectsObserved() {
        List<String> beneficialInsectsObserved = new ArrayList<>();

        for (int i = 0; i < binding.fragmentRecordStep4BeneficialInsectsObservedGridLayout.getChildCount(); i++) {
            CheckBox checkBox = (CheckBox) binding.fragmentRecordStep4BeneficialInsectsObservedGridLayout.getChildAt(i);
            if (checkBox.isChecked()) {
                beneficialInsectsObserved.add(checkBox.getText().toString());
            }
        }

        return beneficialInsectsObserved;
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null; // prevent memory leaks
    }

    @Override
    public void onPickAudio() {
        idontKnowBottomSheetDialog.dismiss();
        pickAudio();
    }

    @Override
    public void onPickPhoto() {
        idontKnowBottomSheetDialog.dismiss();
        pickPhoto();
    }

    @Override
    public void onWriteDown() {
        idontKnowBottomSheetDialog.dismiss();
        idontKnowWriteDownBottomSheetDialog.show(getChildFragmentManager(), "IDontKnowWriteDownBottomSheetDialog");
    }

    @Override
    public void onSaveWriteDown(String description) {
        WriteDownFileView writeDownFileView = new WriteDownFileView(requireContext());
        writeDownFileView.setDescription(description);
        writeDownFileView.setOnCancelClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                binding.fragmentRecordStep4IDontKnowLinearLayout.removeView(writeDownFileView);
            }
        });

        binding.fragmentRecordStep4IDontKnowLinearLayout.removeAllViews();
        binding.fragmentRecordStep4IDontKnowLinearLayout.addView(writeDownFileView);
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
            String extension = FileManager.getFileExtensionSafe(requireContext(), resultUri);
            String fileName = "dontKnowBeneficialInsectsObservedPhoto." + extension;
            dontKnowBeneficialInsectsObservedPhoto = FileManager.getFileFromUri(requireContext(), resultUri, fileName);

            addPhotoView(dontKnowBeneficialInsectsObservedPhoto);

        } catch (Exception e) {
            Log.d("IdontKnowBottomSheetDialog", "Error saving photo");
        }
    }

    private void addPhotoView(File file) {
        PhotoFileView photoFileView = new PhotoFileView(requireContext());
        photoFileView.setDescription("Photo taken of the insect");
        photoFileView.setImageFile(file);
        photoFileView.setOnCancelClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                binding.fragmentRecordStep4IDontKnowLinearLayout.removeView(photoFileView);
            }
        });

        binding.fragmentRecordStep4IDontKnowLinearLayout.removeAllViews();
        binding.fragmentRecordStep4IDontKnowLinearLayout.addView(photoFileView);
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

    private void setupAudioPicker() {

        audioPermissionLauncher = registerForActivityResult(new ActivityResultContracts.RequestPermission(), isGranted -> {
            if (isGranted) {
                launchAudioChooser();
            }
        });

        audioPickerLauncher = registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
            if (result.getResultCode() == Activity.RESULT_OK) {
                handleAudioResult(result.getData());
            }
        });

        audioRecorderLauncher = registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
                    if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                        handleAudioResult(result.getData());
                    }
                }
        );
    }

    private void pickAudio() {
        if (ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
            launchAudioChooser();
        } else {
            audioPermissionLauncher.launch(Manifest.permission.RECORD_AUDIO);
        }
    }

    private void launchAudioChooser() {
        // Intent chooser = Intent.createChooser(getAudioGalleryIntent(), "Select Audio");
        // chooser.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Intent[]{getAudioRecorderIntent()});
        // audioPickerLauncher.launch(chooser);

        Intent intent = new Intent(requireContext(), AudioRecorderActivity.class);
        audioRecorderLauncher.launch(intent);
    }

    private Intent getAudioGalleryIntent() {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("audio/*");
        return intent;
    }

    private Intent getAudioRecorderIntent() {
        return new Intent(MediaStore.Audio.Media.RECORD_SOUND_ACTION);
    }

    private void handleAudioResult(Intent data) {
        Uri resultUri = null;

        if (data != null && data.getData() != null) {
            resultUri = data.getData();

            try {
                requireActivity().getContentResolver().takePersistableUriPermission(
                        resultUri,
                        Intent.FLAG_GRANT_READ_URI_PERMISSION
                );
            } catch (Exception ignored) {
                Log.d("AudioPicker", "Error handling audio");
            }
        }

        if (resultUri != null) {
            processAudio(resultUri);
        }
    }

    private void processAudio(Uri audioUri) {
        try {
            AudioFileView audioFileView = new AudioFileView(requireContext());
            audioFileView.setDescription("Voice note recorded about the insect");
            audioFileView.setAudioUri(audioUri);
            audioFileView.setOnCancelClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    binding.fragmentRecordStep4IDontKnowLinearLayout.removeView(audioFileView);
                }
            });

            binding.fragmentRecordStep4IDontKnowLinearLayout.removeAllViews();
            binding.fragmentRecordStep4IDontKnowLinearLayout.addView(audioFileView);

        } catch (Exception e) {
            Log.d("AudioPicker", "Error handling audio");
        }
    }
}
