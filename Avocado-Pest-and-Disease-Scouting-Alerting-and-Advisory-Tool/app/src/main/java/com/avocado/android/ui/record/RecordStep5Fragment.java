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
import com.avocado.android.databinding.FragmentRecordStep5Binding;
import com.avocado.android.ui.audio.AudioRecorderActivity;
import com.avocado.android.ui.record.callback.OnAudioListener;
import com.avocado.android.ui.record.callback.OnPhotoListener;
import com.avocado.android.ui.record.callback.OnWriteListener;
import com.avocado.android.ui.record.dialogs.AddOtherProductionChallengeBottomSheetDialog;
import com.avocado.android.ui.record.dialogs.IdontKnowBottomSheetDialog;
import com.avocado.android.ui.record.dialogs.IdontKnowWriteDownBottomSheetDialog;
import com.avocado.android.ui.views.AudioFileView;
import com.avocado.android.ui.views.AutoFitGridLayout;
import com.avocado.android.ui.views.CheckBox;
import com.avocado.android.ui.views.CheckBoxFour;
import com.avocado.android.ui.views.CheckBoxOne;
import com.avocado.android.ui.views.CheckBoxOneWithRemove;
import com.avocado.android.ui.views.CheckBoxThree;
import com.avocado.android.ui.views.CheckBoxTwo;
import com.avocado.android.ui.views.FlowLinearLayout;
import com.avocado.android.ui.views.PhotoFileView;
import com.avocado.android.ui.views.RadioButton;
import com.avocado.android.ui.views.RadioButtonSix;
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

public class RecordStep5Fragment extends Fragment implements OnAudioListener, OnPhotoListener, OnWriteListener {

    private RecordsViewModel recordsViewModel;
    private FragmentRecordStep5Binding binding;

    private ActivityResultLauncher<Intent> photoPickerLauncher;
    private ActivityResultLauncher<String> photoPermissionLauncher;
    private ActivityResultLauncher<Intent> audioRecorderLauncher;
    private Uri cameraImageUri;

    private ActivityResultLauncher<Intent> audioPickerLauncher;
    private ActivityResultLauncher<String> audioPermissionLauncher;
    private Uri recordedAudioUri;

    private IdontKnowBottomSheetDialog idontKnowBottomSheetDialog;
    private IdontKnowWriteDownBottomSheetDialog idontKnowWriteDownBottomSheetDialog;

    private File dontKnowDieseasePhoto = null;

    public static RecordStep5Fragment newInstance() {
        return new RecordStep5Fragment();
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

        binding = FragmentRecordStep5Binding.inflate(inflater, container, false);
        idontKnowBottomSheetDialog = new IdontKnowBottomSheetDialog();
        idontKnowWriteDownBottomSheetDialog = new IdontKnowWriteDownBottomSheetDialog();

        idontKnowBottomSheetDialog.setOnAudioListener(this);
        idontKnowBottomSheetDialog.setOnPhotoListener(this);
        idontKnowBottomSheetDialog.setOnWriteListener(this);

        idontKnowWriteDownBottomSheetDialog.setOnWriteListener(this);

        binding.fragmentRecordStep5AddOtherProductionChallengesLinearLayout.setVisibility(View.GONE);

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
        recordsViewModel.getWereAnyDiseasesObserved().observe(getViewLifecycleOwner(), wereAnyDiseasesObserved -> {
            if (wereAnyDiseasesObserved.equals("Yes")) {
                binding.fragmentRecordStep5YesLinearLayout.setVisibility(View.VISIBLE);
            } else if (wereAnyDiseasesObserved.equals("No")) {
                binding.fragmentRecordStep5YesLinearLayout.setVisibility(View.GONE);
            } else {
                binding.fragmentRecordStep5YesLinearLayout.setVisibility(View.GONE);
            }
        });
    }

    private void setupListeners(View view) {
        binding.fragmentRecordStep5YesNoRadioGroup.setOnCheckedChangeListener(new RadioGroup.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(RadioGroup group, RadioButton checkedButton, int checkedId) {
                if (checkedId == R.id.fragment_record_step_5_yes_radio_button) {
                    recordsViewModel.setWereAnyDiseasesObserved("Yes");
                } else if (checkedId == R.id.fragment_record_step_5_no_radio_button) {
                    recordsViewModel.setWereAnyDiseasesObserved("No");
                }
            }
        });

        binding.fragmentRecordStep5OtherProductionChallengesRadioButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                AddOtherProductionChallengeBottomSheetDialog otherProductionChallengesBottomSheetDialog = new AddOtherProductionChallengeBottomSheetDialog();
                otherProductionChallengesBottomSheetDialog.setOnDialogListener(new AddOtherProductionChallengeBottomSheetDialog.OnDialogListener() {
                    @Override
                    public void onAddButtonClicked(String challenge) {
                        addOtherProductionChallenges(challenge);
                    }
                });
                otherProductionChallengesBottomSheetDialog.show(getChildFragmentManager(), "OtherProductionChallengesBottomSheetDialog");
            }
        });

        binding.fragmentRecordStep5SelectDiseaseIDontKnowRadioButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                idontKnowBottomSheetDialog.show(getChildFragmentManager(), "IdontKnowBottomSheetDialog");
            }
        });

        binding.fragmentRecordStep5BackButton.setOnClickListener(v ->
                {
                    setData();
                    Navigation.findNavController(v).popBackStack();
                }
        );

        binding.fragmentRecordStep5ContinueButton.setOnClickListener(v ->
                {
                    if (binding.fragmentRecordStep5YesNoRadioGroup.getCheckedRadioButton() == null)
                        return;

                    setData();
                    Navigation.findNavController(view)
                            .navigate(R.id.action_record_navigation_record_step_5_to_record_step_6_fragment);
                }
        );
    }

    private void addOtherProductionChallenges(String challenge) {
        CheckBoxOneWithRemove checkBox = new CheckBoxOneWithRemove(requireContext());
        checkBox.setText(challenge);
        checkBox.setChecked(true);
        checkBox.setImageVisibility(View.GONE);
        checkBox.setOnCheckedChangeListener(new CheckBox.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CheckBox view, boolean isChecked) {
                if (!isChecked) view.setChecked(true);
            }
        });
        checkBox.setOnClearClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                binding.fragmentRecordStep5AddOtherProductionChallengesFlowLayout.removeView(checkBox);

                if (binding.fragmentRecordStep5AddOtherProductionChallengesFlowLayout.getChildCount() == 0)
                    binding.fragmentRecordStep5AddOtherProductionChallengesLinearLayout.setVisibility(View.GONE);
            }
        });

        binding.fragmentRecordStep5AddOtherProductionChallengesLinearLayout.setVisibility(View.VISIBLE);
        binding.fragmentRecordStep5AddOtherProductionChallengesFlowLayout.addView(checkBox);
    }

    private void restoreState() {
        if (recordsViewModel.data.anyDiseasesObserved == null || recordsViewModel.data.diseases == null
                || recordsViewModel.data.diseasePlantPart == null || recordsViewModel.data.diseaseCropStage == null
                || recordsViewModel.data.diseaseDetectionMethod == null) return;

        if (recordsViewModel.data.anyDiseasesObserved.equalsIgnoreCase("Yes"))
            binding.fragmentRecordStep5YesRadioButton.performClick();
        else if (recordsViewModel.data.anyDiseasesObserved.equalsIgnoreCase("No"))
            binding.fragmentRecordStep5NoRadioButton.performClick();

        for (String disease : recordsViewModel.data.diseases) {
            FlowLinearLayout flowLinearLayout = binding.fragmentRecordStep5DiseasesObservedFlowLayout;
            for (int i = 0; i < flowLinearLayout.getChildCount(); i++) {
                CheckBoxOne checkBox = (CheckBoxOne) flowLinearLayout.getChildAt(i);
                if (checkBox.getText().equalsIgnoreCase(disease)) {
                    checkBox.setChecked(true);
                    break;
                }
            }
        }

        for (String challenge : recordsViewModel.data.otherProductionChallenges) {
            FlowLinearLayout flowLinearLayout = binding.fragmentRecordStep5OtherProductionChallengesFlowLayout;
            for (int i = 0; i < flowLinearLayout.getChildCount(); i++) {
                CheckBoxOne checkBox = (CheckBoxOne) flowLinearLayout.getChildAt(i);
                if (checkBox.getText().equalsIgnoreCase(challenge)) {
                    checkBox.setChecked(true);
                    break;
                }
            }
        }

        List<String> challenges = new ArrayList<>();
        for (int i = 0; i < binding.fragmentRecordStep5OtherProductionChallengesFlowLayout.getChildCount(); i++) {
            CheckBoxOne checkBox = (CheckBoxOne) binding.fragmentRecordStep5OtherProductionChallengesFlowLayout.getChildAt(i);
            challenges.add(checkBox.getText());
        }

        for (String challenge : recordsViewModel.data.otherProductionChallenges) {
            if (!challenges.contains(challenge)) {
                addOtherProductionChallenges(challenge);
            }
        }

        for (String plantPart : recordsViewModel.data.diseasePlantPart) {
            AutoFitGridLayout autoFitGridLayout = binding.fragmentRecordStep5PlantPartAffectedGridLayout;
            for (int i = 0; i < autoFitGridLayout.getChildCount(); i++) {
                CheckBoxTwo checkBox = (CheckBoxTwo) autoFitGridLayout.getChildAt(i);
                if (checkBox.getText().equalsIgnoreCase(plantPart)) {
                    checkBox.setChecked(true);
                    break;
                }
            }
        }

        for (int i = 0; i < binding.fragmentRecordStep5CropStageRadioGroup.getChildCount(); i++) {
            RadioButtonSix radioButton = (RadioButtonSix) binding.fragmentRecordStep5CropStageRadioGroup.getChildAt(i);
            if (radioButton.getText().equalsIgnoreCase(recordsViewModel.data.diseaseCropStage)) {
                radioButton.performClick();
                break;
            }
        }

        for (int i = 0; i < binding.fragmentRecordStep5DetectionMethodRadioGroup.getChildCount(); i++) {
            RadioButtonSix radioButton = (RadioButtonSix) binding.fragmentRecordStep5DetectionMethodRadioGroup.getChildAt(i);
            if (radioButton.getText().equalsIgnoreCase(recordsViewModel.data.diseaseDetectionMethod)) {
                radioButton.performClick();
                break;
            }
        }

        File dontKnowDieseasePhoto = recordsViewModel.data.dontKnowDiseasePhoto;
        if (dontKnowDieseasePhoto == null) return;

        addPhotoView(dontKnowDieseasePhoto);
    }

    private void setData() {
        recordsViewModel.data.anyDiseasesObserved = binding.fragmentRecordStep5YesNoRadioGroup.getCheckedRadioButtonText();
        recordsViewModel.data.diseases = getDiseasesObserved();
        recordsViewModel.data.otherProductionChallenges = getOtherProductionChallenges();
        recordsViewModel.data.diseasePlantPart = getPlantPartAffected();
        recordsViewModel.data.diseaseCropStage = binding.fragmentRecordStep5CropStageRadioGroup.getCheckedRadioButtonText();
        recordsViewModel.data.diseaseDetectionMethod = binding.fragmentRecordStep5DetectionMethodRadioGroup.getCheckedRadioButtonText();
        recordsViewModel.data.dontKnowDisease = false;
        recordsViewModel.data.dontKnowDiseasePhoto = null;
        recordsViewModel.data.dontKnowDiseaseNote = "";
    }

    private List<String> getOtherProductionChallenges() {
        List<String> otherProductionChallenges = new ArrayList<>();

        for (int i = 0; i < binding.fragmentRecordStep5OtherProductionChallengesFlowLayout.getChildCount(); i++) {
            CheckBoxOne checkBox = (CheckBoxOne) binding.fragmentRecordStep5OtherProductionChallengesFlowLayout.getChildAt(i);
            if (checkBox.isChecked()) {
                otherProductionChallenges.add(checkBox.getText());
            }
        }

        for (int i = 0; i < binding.fragmentRecordStep5AddOtherProductionChallengesFlowLayout.getChildCount(); i++) {
            CheckBoxOneWithRemove checkBox = (CheckBoxOneWithRemove) binding.fragmentRecordStep5AddOtherProductionChallengesFlowLayout.getChildAt(i);
            if (checkBox.isChecked()) {
                otherProductionChallenges.add(checkBox.getText());
            }
        }

        return otherProductionChallenges;
    }

    private List<String> getDiseasesObserved() {
        List<String> diseasesObserved = new ArrayList<>();

        for (int i = 0; i < binding.fragmentRecordStep5DiseasesObservedFlowLayout.getChildCount(); i++) {
            CheckBox checkBox = (CheckBox) binding.fragmentRecordStep5DiseasesObservedFlowLayout.getChildAt(i);
            if (checkBox.isChecked()) {
                diseasesObserved.add(checkBox.getText().toString());
            }
        }
        return diseasesObserved;
    }

    private List<String> getPlantPartAffected() {
        List<String> plantPartAffected = new ArrayList<>();

        for (int i = 0; i < binding.fragmentRecordStep5PlantPartAffectedGridLayout.getChildCount(); i++) {
            CheckBox checkBox = (CheckBox) binding.fragmentRecordStep5PlantPartAffectedGridLayout.getChildAt(i);
            if (checkBox.isChecked()) {
                plantPartAffected.add(checkBox.getText().toString());
            }
        }
        return plantPartAffected;
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
                binding.fragmentRecordStep5IDontKnowLinearLayout.removeView(writeDownFileView);
            }
        });

        binding.fragmentRecordStep5IDontKnowLinearLayout.removeAllViews();
        binding.fragmentRecordStep5IDontKnowLinearLayout.addView(writeDownFileView);
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
            String fileName = "dontKnowDieseasePhoto." + extension;
            dontKnowDieseasePhoto = FileManager.getFileFromUri(requireContext(), resultUri, fileName);

            addPhotoView(dontKnowDieseasePhoto);

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
                binding.fragmentRecordStep5IDontKnowLinearLayout.removeView(photoFileView);
            }
        });

        binding.fragmentRecordStep5IDontKnowLinearLayout.removeAllViews();
        binding.fragmentRecordStep5IDontKnowLinearLayout.addView(photoFileView);
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
            audioFileView.setDescription("Voice note recorded about the disease");
            audioFileView.setAudioUri(audioUri);
            audioFileView.setOnCancelClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    binding.fragmentRecordStep5IDontKnowLinearLayout.removeView(audioFileView);
                }
            });

            binding.fragmentRecordStep5IDontKnowLinearLayout.removeAllViews();
            binding.fragmentRecordStep5IDontKnowLinearLayout.addView(audioFileView);

        } catch (Exception e) {
            Log.d("AudioPicker", "Error handling audio");
        }
    }
}
