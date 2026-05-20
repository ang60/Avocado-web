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
import android.widget.LinearLayout;
import android.widget.Toast;

import com.avocado.android.R;
import com.avocado.android.data.model.Data;
import com.avocado.android.data.model.TrapUse;
import com.avocado.android.databinding.FragmentRecordStep2Binding;
import com.avocado.android.ui.audio.AudioRecorderActivity;
import com.avocado.android.ui.record.callback.OnAudioListener;
import com.avocado.android.ui.record.callback.OnPhotoListener;
import com.avocado.android.ui.record.callback.OnWriteListener;
import com.avocado.android.ui.record.dialogs.AddTrapDetailsBottomSheetDialog;
import com.avocado.android.ui.record.dialogs.IdontKnowBottomSheetDialog;
import com.avocado.android.ui.record.dialogs.IdontKnowWriteDownBottomSheetDialog;
import com.avocado.android.ui.record.dialogs.PestCountBottomSheetDialog;
import com.avocado.android.ui.record.dialogs.TakePhotoBottomSheetDialog;
import com.avocado.android.ui.views.AudioFileView;
import com.avocado.android.ui.views.AutoFitGridLayout;
import com.avocado.android.ui.views.CheckBox;
import com.avocado.android.ui.views.CheckBoxFive;
import com.avocado.android.ui.views.CheckBoxThree;
import com.avocado.android.ui.views.PhotoFileView;
import com.avocado.android.ui.views.RadioButton;
import com.avocado.android.ui.views.RadioGroup;
import com.avocado.android.ui.views.TrapUseView;
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

public class RecordStep2Fragment extends Fragment implements OnAudioListener, OnPhotoListener, OnWriteListener {

    private RecordsViewModel recordsViewModel;
    private FragmentRecordStep2Binding binding;

    private ActivityResultLauncher<Intent> photoPickerLauncher;
    private ActivityResultLauncher<String> photoPermissionLauncher;
    private ActivityResultLauncher<Intent> audioRecorderLauncher;
    private Uri cameraImageUri;

    private ActivityResultLauncher<Intent> audioPickerLauncher;
    private ActivityResultLauncher<String> audioPermissionLauncher;
    private Uri recordedAudioUri;

    private IdontKnowBottomSheetDialog idontKnowBottomSheetDialog;
    private IdontKnowWriteDownBottomSheetDialog idontKnowWriteDownBottomSheetDialog;
    private TakePhotoBottomSheetDialog takePhotoBottomSheetDialog;

    private boolean takeOtherTrapPhoto = false;
    private File dontKnowTrapPhoto = null;
    private File otherTrapPhoto = null;

    public static RecordStep2Fragment newInstance() {
        return new RecordStep2Fragment();
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

        binding = FragmentRecordStep2Binding.inflate(inflater, container, false);
        idontKnowBottomSheetDialog = new IdontKnowBottomSheetDialog();
        idontKnowWriteDownBottomSheetDialog = new IdontKnowWriteDownBottomSheetDialog();
        takePhotoBottomSheetDialog = new TakePhotoBottomSheetDialog();

        idontKnowBottomSheetDialog.setOnAudioListener(this);
        idontKnowBottomSheetDialog.setOnPhotoListener(this);
        idontKnowBottomSheetDialog.setOnWriteListener(this);
        takePhotoBottomSheetDialog.setOnPhotoListener(this);

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
        recordsViewModel.getWereAnyTrapsInstalled().observe(getViewLifecycleOwner(), wereAnyTrapsInstalled -> {
            if (wereAnyTrapsInstalled.equals("Yes")) {
                binding.fragmentRecordStep2YesLinearLayout.setVisibility(View.VISIBLE);
                binding.fragmentRecordStep2AddedTrapsTextView.setVisibility(View.VISIBLE);
            } else if (wereAnyTrapsInstalled.equals("No")) {
                binding.fragmentRecordStep2YesLinearLayout.setVisibility(View.GONE);
                binding.fragmentRecordStep2AddedTrapsTextView.setVisibility(View.GONE);
            } else {
                binding.fragmentRecordStep2YesLinearLayout.setVisibility(View.GONE);
                binding.fragmentRecordStep2AddedTrapsTextView.setVisibility(View.GONE);
            }
        });
    }

    private void setupListeners(View view) {
        binding.fragmentRecordStep2WereAnyTrapsInstalledYesNoRadioGroup.setOnCheckedChangeListener(new RadioGroup.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(RadioGroup group, RadioButton checkedButton, int checkedId) {
                if (checkedId == binding.fragmentRecordStep2WereAnyTrapsInstalledYesRadioButton.getId()) {
                    recordsViewModel.setWereAnyTrapsInstalled("Yes");
                }
                else if (checkedId == binding.fragmentRecordStep2WereAnyTrapsInstalledNoRadioButton.getId()) {
                    recordsViewModel.setWereAnyTrapsInstalled("No");
                }
            }
        });

        AutoFitGridLayout autoFitGridLayout = binding.fragmentRecordStep2TrapsGridLayout;
        for (int i = 0; i < autoFitGridLayout.getChildCount(); i++) {
            CheckBoxFive checkBox = (CheckBoxFive) autoFitGridLayout.getChildAt(i);
            checkBox.setOnCheckedChangeListener(new CheckBox.OnCheckedChangeListener() {
                @Override
                public void onCheckedChanged(CheckBox view, boolean isChecked) {
                    if (isChecked) {
                        String title = ((CheckBoxFive)view).getTitle();
                        String subTitle = ((CheckBoxFive)view).getDescription();
                        showBottomSheetDialog(view, title, subTitle);
                    }
                }
            });
        }

        binding.fragmentRecordStep2OtherTrapPhotoRadioButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Bundle args = new Bundle();
                args.putString("title", "Other Trap");
                args.putString("subTitle", "Take photo of the trap");

                takeOtherTrapPhoto = true;
                takePhotoBottomSheetDialog.setArguments(args);
                takePhotoBottomSheetDialog.show(getChildFragmentManager(), "TakePhotoBottomSheetDialog");
            }
        });

        binding.fragmentRecordStep2TypeOfTrapIDontKnowRadioButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                idontKnowBottomSheetDialog.show(getChildFragmentManager(), "IDontKnowBottomSheetDialog");
            }
        });

        binding.fragmentRecordStep2BackButton.setOnClickListener(v ->
            {
                setData();
                Navigation.findNavController(v).popBackStack();
            }
        );

        binding.fragmentRecordStep2ContinueButton.setOnClickListener(v ->
                {
                    if (binding.fragmentRecordStep2WereAnyTrapsInstalledYesNoRadioGroup.getCheckedRadioButton() == null)
                        return;

                    setData();
                    Navigation.findNavController(view)
                            .navigate(R.id.action_record_navigation_record_step_2_to_record_step_3_fragment);
                }
        );
    }

    private void restoreState() {
        if (recordsViewModel.data.anyTrapsInstalled == null || recordsViewModel.data.trapUse == null) return;

        if (recordsViewModel.data.anyTrapsInstalled.equalsIgnoreCase("Yes"))
            binding.fragmentRecordStep2WereAnyTrapsInstalledYesRadioButton.performClick();
        else if (recordsViewModel.data.anyTrapsInstalled.equalsIgnoreCase("No"))
            binding.fragmentRecordStep2WereAnyTrapsInstalledNoRadioButton.performClick();

        for (TrapUse trapUse : recordsViewModel.data.trapUse) {
            addTrapUse(trapUse.getTypeOfTrap(), trapUse.getNumberOfTraps(), trapUse.getAverageNumberOfPestsPerTrap());

            AutoFitGridLayout autoFitGridLayout = binding.fragmentRecordStep2TrapsGridLayout;
            for (int i = 0; i < autoFitGridLayout.getChildCount(); i++) {
                CheckBoxFive checkBox = (CheckBoxFive) autoFitGridLayout.getChildAt(i);
                if (checkBox.getText().equalsIgnoreCase(trapUse.getTypeOfTrap())) {
                    checkBox.setChecked(true);
                    checkBox.setSubTitle(trapUse.getNumberOfTraps() + "traps" + " • " + trapUse.getAverageNumberOfPestsPerTrap() + " total pests");
                    break;
                }
            }
        }

        File otherTrapPhoto = recordsViewModel.data.otherTrapPhoto;
        if (otherTrapPhoto == null) return;

        addOtherPhotoView(otherTrapPhoto);

        File dontKnowTrapPhoto = recordsViewModel.data.dontKnowTrapPhoto;
        if (dontKnowTrapPhoto == null) return;

        addTrapPhotoView(dontKnowTrapPhoto);
    }

    private void setData() {
        recordsViewModel.data.anyTrapsInstalled = binding.fragmentRecordStep2WereAnyTrapsInstalledYesNoRadioGroup.getCheckedRadioButtonText();
        recordsViewModel.data.trapUse = getTrapUses();
        recordsViewModel.data.dontKnowTrapPhoto = dontKnowTrapPhoto;
        recordsViewModel.data.otherTrapPhoto = otherTrapPhoto;
    }

    private List<TrapUse> getTrapUses() {
        List<TrapUse> trapUses = new ArrayList<>();

        LinearLayout trapUseLinearLayout = binding.fragmentRecordStep2TrapUseLinearLayout;
        for (int i = 0; i < trapUseLinearLayout.getChildCount(); i++) {
            TrapUseView trapUseView = (TrapUseView) trapUseLinearLayout.getChildAt(i);

            TrapUse trapUse = new TrapUse();
            trapUse.setTypeOfTrap(trapUseView.getTrapName());
            trapUse.setNumberOfTraps(trapUseView.getNumberOfTraps());
            trapUse.setAverageNumberOfPestsPerTrap(trapUseView.getNumberOfPestsObserved());
            trapUse.setTrapPhoto(null);

            trapUses.add(trapUse);
        }

        return trapUses;
    }

    private void showBottomSheetDialog(View view, String title, String subTitle) {
        AddTrapDetailsBottomSheetDialog dialog = new AddTrapDetailsBottomSheetDialog();

        Bundle args = new Bundle();
        args.putString("title", title);
        args.putString("subTitle", subTitle);

        dialog.setArguments(args);
        dialog.setOnDialogListener(new AddTrapDetailsBottomSheetDialog.OnDialogListener() {
            @Override
            public void onAddButtonClicked(String title, int numberOfTraps, int numberOfPests) {
                ((CheckBoxFive) view).setSubTitle(numberOfTraps + "traps" + " • " + numberOfPests + " total pests");
                addTrapUse(title, numberOfTraps, numberOfPests);
                binding.fragmentRecordStep2AddedTrapsTextView.setVisibility(View.VISIBLE);
            }
        });
        dialog.show(getChildFragmentManager(), "PestCountBottomSheetDialog");
    }

    private void addTrapUse(String title, int numberOfTraps, int numberOfPests) {
        LinearLayout trapUseLinearLayout = binding.fragmentRecordStep2TrapUseLinearLayout;
        TrapUseView trapUseView = new TrapUseView(requireContext());
        trapUseView.setNumberOfTraps(numberOfTraps);
        trapUseView.setNumberOfPestsObserved(numberOfPests);
        trapUseView.setTrapName(title);
        trapUseView.setNumberOfPestsTextView(numberOfTraps + "traps" + " • " + numberOfPests + " total pests");

        trapUseView.setOnDeleteClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                trapUseLinearLayout.removeView(trapUseView);

                if (trapUseLinearLayout.getChildCount() == 0)
                    binding.fragmentRecordStep2AddedTrapsTextView.setVisibility(View.GONE);
            }
        });
        trapUseView.setOnEditClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {

            }
        });

        trapUseLinearLayout.addView(trapUseView);
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
        if (takeOtherTrapPhoto)
            takePhotoBottomSheetDialog.dismiss();
        else
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
                binding.fragmentRecordStep2IDontKnowLinearLayout.removeView(writeDownFileView);
            }
        });

        binding.fragmentRecordStep2IDontKnowLinearLayout.removeAllViews();
        binding.fragmentRecordStep2IDontKnowLinearLayout.addView(writeDownFileView);
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
            if (takeOtherTrapPhoto) {
                String extension = FileManager.getFileExtensionSafe(requireContext(), resultUri);
                String fileName = "otherTrapPhoto." + extension;
                otherTrapPhoto = FileManager.getFileFromUri(requireContext(), resultUri, fileName);

                addOtherPhotoView(otherTrapPhoto);
            }
            else {
                String extension = FileManager.getFileExtensionSafe(requireContext(), resultUri);
                String fileName = "dontKnowTrapPhoto." + extension;
                dontKnowTrapPhoto = FileManager.getFileFromUri(requireContext(), resultUri, fileName);

                addTrapPhotoView(dontKnowTrapPhoto);
            }

        } catch (Exception e) {
            Log.d("IdontKnowBottomSheetDialog", "Error saving photo");
        }
    }

    private void addOtherPhotoView(File file) {
        PhotoFileView photoFileView = new PhotoFileView(requireContext());
        photoFileView.setDescription("Photo taken of other trap");
        photoFileView.setImageFile(file);
        photoFileView.setOnCancelClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                binding.fragmentRecordStep2OtherTrapPhotoLinearLayout.removeView(photoFileView);
            }
        });

        binding.fragmentRecordStep2OtherTrapPhotoLinearLayout.removeAllViews();
        binding.fragmentRecordStep2OtherTrapPhotoLinearLayout.addView(photoFileView);
        takeOtherTrapPhoto = false;
    }

    private void addTrapPhotoView(File file) {
        PhotoFileView photoFileView = new PhotoFileView(requireContext());
        photoFileView.setDescription("Photo taken of the trap");
        photoFileView.setImageFile(file);
        photoFileView.setOnCancelClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                binding.fragmentRecordStep2IDontKnowLinearLayout.removeView(photoFileView);
            }
        });

        binding.fragmentRecordStep2IDontKnowLinearLayout.removeAllViews();
        binding.fragmentRecordStep2IDontKnowLinearLayout.addView(photoFileView);
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
            audioFileView.setDescription("Voice note recorded about the trap");
            audioFileView.setAudioUri(audioUri);
            audioFileView.setOnCancelClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    binding.fragmentRecordStep2IDontKnowLinearLayout.removeView(audioFileView);
                }
            });

            binding.fragmentRecordStep2IDontKnowLinearLayout.removeAllViews();
            binding.fragmentRecordStep2IDontKnowLinearLayout.addView(audioFileView);

        } catch (Exception e) {
            Log.d("AudioPicker", "Error handling audio");
        }
    }
}
