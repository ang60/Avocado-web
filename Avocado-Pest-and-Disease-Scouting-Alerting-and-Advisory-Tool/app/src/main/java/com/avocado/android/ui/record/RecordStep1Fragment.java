package com.avocado.android.ui.record;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.media.MediaRecorder;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.LinearLayout;
import android.widget.Toast;

import com.androidnetworking.AndroidNetworking;
import com.androidnetworking.common.Priority;
import com.androidnetworking.error.ANError;
import com.androidnetworking.interfaces.JSONObjectRequestListener;
import com.avocado.android.R;
import com.avocado.android.data.model.Block;
import com.avocado.android.data.model.Data;
import com.avocado.android.data.model.Farm;
import com.avocado.android.data.model.FarmBlock;
import com.avocado.android.databinding.FragmentRecordStep1Binding;
import com.avocado.android.ui.audio.AudioRecorderActivity;
import com.avocado.android.ui.manageblocks.ManageBlocksActivity;
import com.avocado.android.ui.managefarms.ManageFarmsActivity;
import com.avocado.android.ui.record.callback.OnAudioListener;
import com.avocado.android.ui.record.callback.OnPhotoListener;
import com.avocado.android.ui.record.callback.OnWriteListener;
import com.avocado.android.ui.record.dialogs.IdontKnowBottomSheetDialog;
import com.avocado.android.ui.record.dialogs.IdontKnowWriteDownBottomSheetDialog;
import com.avocado.android.ui.start.StartActivity;
import com.avocado.android.ui.views.AudioFileView;
import com.avocado.android.ui.views.AutoFitGridLayout;
import com.avocado.android.ui.views.AutoFitGridLayoutManager;
import com.avocado.android.ui.views.AutoFitGridRadioGroup;
import com.avocado.android.ui.views.PhotoFileView;
import com.avocado.android.ui.views.ProgressDialog;
import com.avocado.android.ui.views.RadioButton;
import com.avocado.android.ui.views.RadioButtonSixteen;
import com.avocado.android.ui.views.RadioGroup;
import com.avocado.android.ui.views.RecursiveRadioGroup;
import com.avocado.android.ui.views.WriteDownFileView;
import com.avocado.android.utils.Config;
import com.avocado.android.utils.Constants;
import com.avocado.android.utils.DateTimeManager;
import com.avocado.android.utils.FileManager;
import com.avocado.android.utils.TokenManager;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.Navigation;
import androidx.recyclerview.widget.RecyclerView;

import static android.app.Activity.RESULT_OK;

public class RecordStep1Fragment extends Fragment implements OnAudioListener, OnPhotoListener, OnWriteListener {

    private RecordsViewModel recordsViewModel;
    private FragmentRecordStep1Binding binding;

    private ActivityResultLauncher<Intent> photoPickerLauncher;
    private ActivityResultLauncher<String> photoPermissionLauncher;
    private Uri cameraImageUri;

    private ActivityResultLauncher<Intent> audioPickerLauncher;
    private ActivityResultLauncher<String> audioPermissionLauncher;
    private ActivityResultLauncher<Intent> audioRecorderLauncher;
    private Uri recordedAudioUri;

    private ActivityResultLauncher<Intent> manageFarmsLauncher;
    private ActivityResultLauncher<Intent> manageBlocksLauncher;

    private IdontKnowBottomSheetDialog idontKnowBottomSheetDialog;
    private IdontKnowWriteDownBottomSheetDialog idontKnowWriteDownBottomSheetDialog;
    private ProgressDialog progressDialog;

    private ArrayAdapter<Farm> farmAdapter;

    private String farmId = "";
    private File dontKnowVarietyPhoto = null;

    private Gson gson;

    public static RecordStep1Fragment newInstance() {
        return new RecordStep1Fragment();
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        gson = new GsonBuilder().setPrettyPrinting().create();
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        // Activity-scoped Android ViewModel so all fragments inside the same activity share one ViewModel instance
        // requireActivity() returns the activity that created the fragment
        recordsViewModel = new ViewModelProvider(requireActivity()).get(RecordsViewModel.class);

        binding = FragmentRecordStep1Binding.inflate(inflater, container, false);
        idontKnowBottomSheetDialog = new IdontKnowBottomSheetDialog();
        idontKnowWriteDownBottomSheetDialog = new IdontKnowWriteDownBottomSheetDialog();
        progressDialog = ProgressDialog.create(requireContext(), "Loading...");

        idontKnowBottomSheetDialog.setOnAudioListener(this);
        idontKnowBottomSheetDialog.setOnPhotoListener(this);
        idontKnowBottomSheetDialog.setOnWriteListener(this);

        idontKnowWriteDownBottomSheetDialog.setOnWriteListener(this);

        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        checkTokenExpired();

        setRecordData();
        observeViewModel();
        setupListeners(view);
        setupPhotoPicker();
        setupAudioPicker();
        setupManageFarms();
        setupManageBlocks();
        restoreState();

        binding.fragmentRecordStep1NoFarmsLinearLayout.setVisibility(View.GONE);
        binding.fragmentRecordStep1NoFarmBlocksLinearLayout.setVisibility(View.GONE);
    }

    @Override
    public void onResume() {
        super.onResume();
    }

    private void setRecordData() {
        Bundle bundle = getArguments();
        if (bundle == null) return;

        if (!bundle.getString("Record","").isEmpty()) {
            String filePath = bundle.getString("Record");
            if (filePath == null) return;

            File file = new File(filePath);
            String json = FileManager.readJsonFromFile(file);

            recordsViewModel.data = gson.fromJson(json, Data.class);
            getDontKnowVarietyPhoto();

            Log.d("RecordStep1Fragment", "setRecordData: " + json);
        }
    }

    private void getDontKnowVarietyPhoto() {
        String directory = Config.getBaseDirectory() + "/images";

        try {
            recordsViewModel.data.dontKnowVarietyPhoto = FileManager.getFile(requireContext(),
                    directory, "dontKnowVarietyPhoto.jpg");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void setRecord() {

    }

    private void insertFarmBlocks(List<FarmBlock> farmBlocks) {
        AutoFitGridRadioGroup autoFitGridRadioGroup = binding.fragmentRecordStep1FarmBlocksAutoFitRadioGroup;
        autoFitGridRadioGroup.removeAllViews();

        ViewGroup.LayoutParams params = new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT);

        for (FarmBlock farmBlock : farmBlocks) {
            RadioButtonSixteen radioButton = new RadioButtonSixteen(requireContext());
            radioButton.setTag(farmBlock);
            radioButton.setId(View.generateViewId());
            radioButton.setLayoutParams(params);
            radioButton.setImageResource(R.drawable.ic_tree);
            radioButton.setTitle(farmBlock.getName());
            radioButton.setSubTitle(farmBlock.getNumberOfTrees() + " Trees");
            autoFitGridRadioGroup.addView(radioButton);
        }
    }

    private void setFarmBlockVisibility(String farmId) {
        AutoFitGridRadioGroup autoFitGridRadioGroup = binding.fragmentRecordStep1FarmBlocksAutoFitRadioGroup;
        for (int i = 0; i < autoFitGridRadioGroup.getChildCount(); i++) {
            RadioButton radioButton = (RadioButton)autoFitGridRadioGroup.getChildAt(i);
            radioButton.setChecked(false);

            FarmBlock farmBlock = (FarmBlock)autoFitGridRadioGroup.getChildAt(i).getTag();
            if (farmBlock.getFarmId().equals(farmId)) {
                autoFitGridRadioGroup.getChildAt(i).setVisibility(View.VISIBLE);

                if (farmBlock.getId().equals(recordsViewModel.data.blockId))
                    autoFitGridRadioGroup.getChildAt(i).performClick();
            }
            else {
                autoFitGridRadioGroup.getChildAt(i).setVisibility(View.GONE);
            }
        }
    }

    private void observeViewModel() {
        recordsViewModel.getFarmList().observe(getViewLifecycleOwner(), farms -> {
            farmAdapter = new ArrayAdapter<>(requireContext(), android.R.layout.simple_dropdown_item_1line, farms);
            binding.fragmentRecordStep1SelectFarmAutoCompleteTextView.setAdapter(farmAdapter);

            for (int i = 0; i < farmAdapter.getCount(); i++) {
                if (farmAdapter.getItem(i).getFarmId().equals(recordsViewModel.data.farmId)) {
                    binding.fragmentRecordStep1SelectFarmAutoCompleteTextView.setText(farmAdapter.getItem(i).toString(), false);
                    recordsViewModel.setSelectedFarm(farmAdapter.getItem(i).toString());
                    break;
                }
            }
        });

        recordsViewModel.getFarmBlockList().observe(getViewLifecycleOwner(), farmBlocks -> {
            insertFarmBlocks(farmBlocks);
        });

        recordsViewModel.getSelectedFarmId().observe(getViewLifecycleOwner(), farmId -> {
            setFarmBlockVisibility(farmId);
        });

        recordsViewModel.getSelectedFarm().observe(getViewLifecycleOwner(), farmName -> {
            setFarmBlockVisibility(recordsViewModel.data.farmId);
        });
    }

    private void setupListeners(View view) {
        binding.fragmentRecordStep1NoFarmsLinearLayout.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(getActivity(), ManageFarmsActivity.class);
                manageFarmsLauncher.launch(intent);
            }
        });

        binding.fragmentRecordStep1NoFarmBlocksLinearLayout.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(getActivity(), ManageBlocksActivity.class);
                manageBlocksLauncher.launch(intent);
            }
        });

        binding.fragmentRecordStep1SelectFarmAutoCompleteTextView.setOnItemClickListener((adapterView, view1, i, l) -> {
            if (recordsViewModel.getFarmList().getValue() == null
                    || recordsViewModel.getFarmList().getValue().isEmpty()) return;
            farmId = recordsViewModel.getFarmList().getValue().get(i).getFarmId();
            recordsViewModel.data.blockId = "";
            recordsViewModel.data.farmId = farmId;
            recordsViewModel.setSelectedFarmId(farmId);
        });

        binding.fragmentRecordStep1FarmBlocksAutoFitRadioGroup.setOnCheckedChangeListener(new AutoFitGridRadioGroup.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(AutoFitGridRadioGroup group, RadioButton checkedButton, int checkedId) {
                FarmBlock farmBlock = (FarmBlock) checkedButton.getTag();
                recordsViewModel.data.blockId = farmBlock.getId();
                recordsViewModel.data.farmName = farmBlock.getFarmName();
                recordsViewModel.data.location = farmBlock.getLocation();
                recordsViewModel.data.blockName = farmBlock.getName();

            }
        });

        binding.fragmentRecordStep1AvocadoVarietyIDontKnowRadioButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                idontKnowBottomSheetDialog.show(getChildFragmentManager(), "IDontKnowBottomSheetDialog");
            }
        });

        binding.fragmentRecordStep1BackButton.setOnClickListener(v ->
                requireActivity().getOnBackPressedDispatcher().onBackPressed()
        );

        binding.fragmentRecordStep1ContinueButton.setOnClickListener(v ->
                {
                    if (recordsViewModel.data.blockId == null || recordsViewModel.data.blockId.isEmpty())
                        return;

                    setData();
                    Navigation.findNavController(view)
                            .navigate(R.id.action_record_navigation_record_step_1_to_record_step_2_fragment);
                }
        );
    }

    private void restoreState() {
        if (recordsViewModel.data.farmId == null || recordsViewModel.data.farmId.isEmpty()
                || recordsViewModel.data.blockId == null || recordsViewModel.data.blockId.isEmpty()
                || recordsViewModel.data.variety == null || recordsViewModel.data.variety.isEmpty()) return;

        RadioGroup radioGroup = binding.fragmentRecordStep1AvocadoVarietyRadioGroup;
        for (int i = 0; i < radioGroup.getChildCount(); i++) {
            RadioButton radioButton = (RadioButton) radioGroup.getChildAt(i);
            if (radioButton.getText().equals(recordsViewModel.data.variety)) {
                radioButton.performClick();
                break;
            }
        }

        File dontKnowVarietyPhoto = recordsViewModel.data.dontKnowVarietyPhoto;
        if (dontKnowVarietyPhoto == null) return;

        addPhotoView(dontKnowVarietyPhoto);
    }

    private void setData() {
        TokenManager tokenManager = new TokenManager(requireContext());
        String userId = tokenManager.getUserId();

        recordsViewModel.data.farmerId = userId;
        recordsViewModel.data.startDate = DateTimeManager.convertEpochToDate2(System.currentTimeMillis());
        recordsViewModel.data.dontKnowVariety = false;
        recordsViewModel.data.dontKnowVarietyPhoto = dontKnowVarietyPhoto;
        recordsViewModel.data.dontKnowVarietyNote = "";
        recordsViewModel.data.variety = getVariety();

        // Set start timestamp if not set. Allows update of previously saved records
        if (recordsViewModel.data.startTimestamp == null || recordsViewModel.data.startTimestamp.isEmpty())
            recordsViewModel.data.startTimestamp = String.valueOf(System.currentTimeMillis());
    }

    private String getVariety() {
        if (binding.fragmentRecordStep1AvocadoVarietyRadioGroup.getCheckedRadioButton() == null)
            return "I don't know";
        else
            return binding.fragmentRecordStep1AvocadoVarietyRadioGroup.getCheckedRadioButtonText();
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
                binding.fragmentRecordStep1IDontKnowLinearLayout.removeView(writeDownFileView);
            }
        });

        binding.fragmentRecordStep1IDontKnowLinearLayout.removeAllViews();
        binding.fragmentRecordStep1IDontKnowLinearLayout.addView(writeDownFileView);
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
                    if (result.getResultCode() == RESULT_OK) {
                        handlePhotoResult(result.getData());
                    }
                }
        );
    }

    private void handlePhotoResult(Intent data) {
        Uri resultUri;

        if (data != null && data.getData() != null) {
            resultUri = data.getData();
            requireActivity().getContentResolver().takePersistableUriPermission(resultUri,
                    Intent.FLAG_GRANT_READ_URI_PERMISSION);
        } else {
            resultUri = cameraImageUri;
        }

        try {
            String extension = FileManager.getFileExtensionSafe(requireContext(), resultUri);
            String fileName = "dontKnowVarietyPhoto." + extension;
            dontKnowVarietyPhoto = FileManager.getFileFromUri(requireContext(), resultUri, fileName);

            addPhotoView(dontKnowVarietyPhoto);

        } catch (Exception e) {
            Log.d("IdontKnowBottomSheetDialog", "Error saving photo");
        }
    }

    private void addPhotoView(File file) {
        PhotoFileView photoFileView = new PhotoFileView(requireContext());
        photoFileView.setDescription("Photo taken of the avocado variety");
        photoFileView.setImageFile(file);
        photoFileView.setOnCancelClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                binding.fragmentRecordStep1IDontKnowLinearLayout.removeView(photoFileView);
            }
        });

        binding.fragmentRecordStep1IDontKnowLinearLayout.removeAllViews();
        binding.fragmentRecordStep1IDontKnowLinearLayout.addView(photoFileView);
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
            if (result.getResultCode() == RESULT_OK) {
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
                requireActivity().getContentResolver().takePersistableUriPermission(resultUri,
                        Intent.FLAG_GRANT_READ_URI_PERMISSION);
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
            audioFileView.setDescription("Voice note recorded about the avocado variety");
            audioFileView.setAudioUri(audioUri);
            audioFileView.setOnCancelClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    binding.fragmentRecordStep1IDontKnowLinearLayout.removeView(audioFileView);
                }
            });

            binding.fragmentRecordStep1IDontKnowLinearLayout.removeAllViews();
            binding.fragmentRecordStep1IDontKnowLinearLayout.addView(audioFileView);

        } catch (Exception e) {
            Log.d("AudioPicker", "Error handling audio");
        }
    }

    private void setupManageFarms() {
        manageFarmsLauncher = registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
            if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                progressDialog.show();
                //getFarms();
            }
        });
    }

    private void setupManageBlocks() {
        manageBlocksLauncher = registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
            if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                if (farmId.isEmpty()) return;
                progressDialog.show();
                //getBlocks();
            }
        });
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

    private void addFarm() {
        binding.fragmentRecordStep1NoFarmsLinearLayout.setVisibility(View.VISIBLE);
        binding.fragmentRecordStep1SelectFarmTextInputLayout.setVisibility(View.GONE);
        binding.fragmentRecordStep1NoFarmBlocksLinearLayout.setVisibility(View.GONE);
    }

    private void addBlock() {
        binding.fragmentRecordStep1NoFarmBlocksLinearLayout.setVisibility(View.VISIBLE);
    }
}
