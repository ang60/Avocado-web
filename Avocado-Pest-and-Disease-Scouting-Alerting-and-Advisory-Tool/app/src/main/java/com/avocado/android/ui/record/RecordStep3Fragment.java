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
import com.avocado.android.data.model.TrapUse;
import com.avocado.android.databinding.FragmentRecordStep3Binding;
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
import com.avocado.android.ui.views.CheckBoxThree;
import com.avocado.android.ui.views.PhotoFileView;
import com.avocado.android.ui.views.RadioButton;
import com.avocado.android.ui.views.RadioGroup;
import com.avocado.android.ui.views.RecursiveRadioGroup;
import com.avocado.android.ui.views.WriteDownFileView;

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

public class RecordStep3Fragment extends Fragment implements OnAudioListener, OnPhotoListener, OnWriteListener, AddOtherPestBottomSheetDialog.OnDialogListener {

    private RecordsViewModel recordsViewModel;
    private FragmentRecordStep3Binding binding;

    private ActivityResultLauncher<Intent> photoPickerLauncher;
    private ActivityResultLauncher<String> photoPermissionLauncher;
    private ActivityResultLauncher<Intent> audioRecorderLauncher;
    private Uri cameraImageUri;

    private ActivityResultLauncher<Intent> audioPickerLauncher;
    private ActivityResultLauncher<String> audioPermissionLauncher;
    private Uri recordedAudioUri;

    private IdontKnowBottomSheetDialog idontKnowBottomSheetDialog;
    private IdontKnowWriteDownBottomSheetDialog idontKnowWriteDownBottomSheetDialog;
    private AddOtherPestBottomSheetDialog addOtherPestBottomSheetDialog;

    public static RecordStep3Fragment newInstance() {
        return new RecordStep3Fragment();
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
        recordsViewModel = new ViewModelProvider(this).get(RecordsViewModel.class);
        binding = FragmentRecordStep3Binding.inflate(inflater, container, false);
        idontKnowBottomSheetDialog = new IdontKnowBottomSheetDialog();
        idontKnowWriteDownBottomSheetDialog = new IdontKnowWriteDownBottomSheetDialog();
        addOtherPestBottomSheetDialog = new AddOtherPestBottomSheetDialog();

        idontKnowBottomSheetDialog.setOnAudioListener(this);
        idontKnowBottomSheetDialog.setOnPhotoListener(this);
        idontKnowBottomSheetDialog.setOnWriteListener(this);
        idontKnowWriteDownBottomSheetDialog.setOnWriteListener(this);
        addOtherPestBottomSheetDialog.setOnDialogListener(this);

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
        recordsViewModel.getWereAnyPestsObserved().observe(getViewLifecycleOwner(), wereAnyPestsObserved -> {
            if (wereAnyPestsObserved.equals("Yes")) {
                binding.fragmentRecordStep3YesLinearLayout.setVisibility(View.VISIBLE);
            } else if (wereAnyPestsObserved.equals("No")) {
                binding.fragmentRecordStep3YesLinearLayout.setVisibility(View.GONE);
            } else {
                binding.fragmentRecordStep3YesLinearLayout.setVisibility(View.GONE);
            }
        });
    }

    private void setupListeners(View view) {

        binding.fragmentRecordStep3WereAnyPestsYesNoRadioGroup.setOnCheckedChangeListener(new RadioGroup.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(RadioGroup group, RadioButton checkedButton, int checkedId) {
                if (checkedId == R.id.fragment_record_step_3_were_any_pests_observed_yes_radio_button) {
                    recordsViewModel.setWereAnyPestsObserved("Yes");
                } else if (checkedId == R.id.fragment_record_step_3_were_any_pests_observed_no_radio_button) {
                    recordsViewModel.setWereAnyPestsObserved("No");
                }
            }
        });

        AutoFitGridLayout autoFitGridLayout = binding.fragmentRecordStep3PestsObservedGridLayout;
        for (int i = 0; i < autoFitGridLayout.getChildCount(); i++) {
            CheckBoxThree checkBox = (CheckBoxThree) autoFitGridLayout.getChildAt(i);
            checkBox.setOnCheckedChangeListener(new CheckBox.OnCheckedChangeListener() {
                @Override
                public void onCheckedChanged(CheckBox view, boolean isChecked) {
                    if (isChecked) {
                        showBottomSheetDialog(view);
                    }
                }
            });
        }

        binding.fragmentRecordStep3PestsObservedAddOtherPestRadioButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                addOtherPestBottomSheetDialog.show(getChildFragmentManager(), "AddOtherPestBottomSheetDialog");
            }
        });

        binding.fragmentRecordStep3PestsObservedIDontKnowRadioButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                idontKnowBottomSheetDialog.show(getChildFragmentManager(), "IDontKnowBottomSheetDialog");
            }
        });

        binding.fragmentRecordStep3BackButton.setOnClickListener(v ->
                Navigation.findNavController(v).popBackStack()
        );

        binding.fragmentRecordStep3ContinueButton.setOnClickListener(v ->
                {
                    if (binding.fragmentRecordStep3WereAnyPestsYesNoRadioGroup.getCheckedRadioButton() == null)
                        return;

                    setData();
                    Navigation.findNavController(view).navigate(R.id.action_record_navigation_record_step_3_to_record_step_4_fragment);
                }
        );
    }

    private void restoreState() {
        if (Data.anyPestsObserved == null || Data.pestsObserved == null) return;

        if (Data.anyPestsObserved.equalsIgnoreCase("Yes"))
            binding.fragmentRecordStep3WereAnyPestsObservedYesRadioButton.performClick();
        else if (Data.anyPestsObserved.equalsIgnoreCase("No"))
            binding.fragmentRecordStep3WereAnyPestsObservedNoRadioButton.performClick();

        for (PestsObserved pestObserved : Data.pestsObserved) {
            AutoFitGridLayout autoFitGridLayout = binding.fragmentRecordStep3PestsObservedGridLayout;
            for (int i = 0; i < autoFitGridLayout.getChildCount(); i++) {
                CheckBoxThree checkBox = (CheckBoxThree) autoFitGridLayout.getChildAt(i);
                if (checkBox.getText().equalsIgnoreCase(pestObserved.getName())) {
                    checkBox.setChecked(true);
                    checkBox.setSubTitle(pestObserved.getNumberPerTrap() + "/Trap");
                    break;
                }
            }
        }
    }

    private void setData() {
        Data.anyPestsObserved = binding.fragmentRecordStep3WereAnyPestsYesNoRadioGroup.getCheckedRadioButtonText();
        Data.pestsObserved = getPestsObserved();
        Data.dontKnowPest = false;
        Data.dontKnowPestPhoto = null;
        Data.dontKnowPestNote = "";
    }

    private List<PestsObserved> getPestsObserved() {
        List<PestsObserved> pestsObserved = new ArrayList<>();

        for (int i = 0; i < binding.fragmentRecordStep3PestsObservedGridLayout.getChildCount(); i++) {
            CheckBoxThree checkBox = (CheckBoxThree) binding.fragmentRecordStep3PestsObservedGridLayout.getChildAt(i);
            if (checkBox.isChecked()) {
                PestsObserved pestsObserved1 = new PestsObserved();
                pestsObserved1.setName(checkBox.getText().toString());
                pestsObserved1.setPhotoTrap(null);

                String[] parts = checkBox.getSubTitle().split("/");
                pestsObserved1.setNumberPerTrap(parts[0].length() == 0 ? 0 : Integer.parseInt(parts[0]));

                pestsObserved.add(pestsObserved1);
            }
        }

        return pestsObserved;
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null; // prevent memory leaks
    }

    private void showBottomSheetDialog(View view) {
        PestCountBottomSheetDialog dialog = new PestCountBottomSheetDialog();
        dialog.setOnDialogListener(new PestCountBottomSheetDialog.OnDialogListener() {
            @Override
            public void onAddButtonClicked(int count) {
                ((CheckBoxThree) view).setSubTitle(count + "/" + "Trap");
            }
        });
        dialog.show(getChildFragmentManager(), "PestCountBottomSheetDialog");
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
                binding.fragmentRecordStep3PestsObservedIDontKnowLinearLayout.removeView(writeDownFileView);
            }
        });

        binding.fragmentRecordStep3PestsObservedIDontKnowLinearLayout.removeAllViews();
        binding.fragmentRecordStep3PestsObservedIDontKnowLinearLayout.addView(writeDownFileView);
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
                    binding.fragmentRecordStep3PestsObservedIDontKnowLinearLayout.removeView(photoFileView);
                }
            });

            binding.fragmentRecordStep3PestsObservedIDontKnowLinearLayout.removeAllViews();
            binding.fragmentRecordStep3PestsObservedIDontKnowLinearLayout.addView(photoFileView);

        } catch (Exception e) {
            Log.d("IdontKnowBottomSheetDialog", "Error saving photo");
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
            audioFileView.setDescription("Voice note recorded about the pest");
            audioFileView.setAudioUri(audioUri);
            audioFileView.setOnCancelClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    binding.fragmentRecordStep3PestsObservedIDontKnowLinearLayout.removeView(audioFileView);
                }
            });

            binding.fragmentRecordStep3PestsObservedIDontKnowLinearLayout.removeAllViews();
            binding.fragmentRecordStep3PestsObservedIDontKnowLinearLayout.addView(audioFileView);

        } catch (Exception e) {
            Log.d("AudioPicker", "Error handling audio");
        }
    }

    @Override
    public void onAddButtonClicked(Uri imageUri, String pestName, int numberPerTrap) {
        CheckBoxThree checkBox = new CheckBoxThree(requireContext());
        checkBox.setImageUri(imageUri);
        checkBox.setTitle(pestName);
        checkBox.setSubTitle(numberPerTrap + "/" + "Trap");
        checkBox.setChecked(true);
        checkBox.setOnCheckedChangeListener(new CheckBox.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CheckBox view, boolean isChecked) {
                if (isChecked) {
                    showBottomSheetDialog(view);
                }
            }
        });

        binding.fragmentRecordStep3PestsObservedGridLayout.addView(checkBox);
    }
}
