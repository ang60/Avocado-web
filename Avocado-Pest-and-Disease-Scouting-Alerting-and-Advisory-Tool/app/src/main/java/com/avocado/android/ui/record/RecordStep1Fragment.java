package com.avocado.android.ui.record;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.media.MediaRecorder;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
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
import com.avocado.android.ui.views.AutoFitGridLayoutManager;
import com.avocado.android.ui.views.PhotoFileView;
import com.avocado.android.ui.views.ProgressDialog;
import com.avocado.android.ui.views.WriteDownFileView;
import com.avocado.android.utils.Constants;
import com.avocado.android.utils.DateTimeManager;
import com.avocado.android.utils.TokenManager;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
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

public class RecordStep1Fragment extends Fragment implements FarmBlockAdapter.FarmBlockListener, OnAudioListener, OnPhotoListener, OnWriteListener {

    private RecordsViewModel recordsViewModel;
    private FarmBlockAdapter farmBlockAdapter;
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
    private List<Farm> farmList = new ArrayList<>();

    private String farmId = "";

    public static RecordStep1Fragment newInstance() {
        return new RecordStep1Fragment();
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
        binding = FragmentRecordStep1Binding.inflate(inflater, container, false);
        idontKnowBottomSheetDialog = new IdontKnowBottomSheetDialog();
        idontKnowWriteDownBottomSheetDialog = new IdontKnowWriteDownBottomSheetDialog();
        progressDialog = ProgressDialog.create(requireContext(), "Loading...");
        farmAdapter = new ArrayAdapter<>(requireContext(), android.R.layout.simple_list_item_1, farmList);

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

        observeViewModel();
        setupRecyclerView();
        setupListeners(view);
        setupPhotoPicker();
        setupAudioPicker();
        setupManageFarms();
        setupManageBlocks();

        binding.fragmentRecordStep1NoFarmsLinearLayout.setVisibility(View.GONE);
        binding.fragmentRecordStep1NoFarmBlocksLinearLayout.setVisibility(View.GONE);

        progressDialog.show();
        getFarms();
    }

    @Override
    public void onResume() {
        super.onResume();
    }

    private void setupRecyclerView() {
        farmBlockAdapter = new FarmBlockAdapter(this);
        RecyclerView rv = binding.fragmentRecordStep1FarmBlocksRecyclerView;

        rv.setLayoutManager(new AutoFitGridLayoutManager(requireContext(), 160));
        rv.setAdapter(farmBlockAdapter);
    }

    private void observeViewModel() {
        recordsViewModel.getFarmList().observe(getViewLifecycleOwner(), farm -> {
            farmAdapter.notifyDataSetChanged();
        });

        recordsViewModel.getFarmBlockList().observe(getViewLifecycleOwner(), farmBlocks -> {
            farmBlockAdapter.setFarmBlockList(farmBlocks);
            farmBlockAdapter.setFarmBlockListFull(farmBlocks);
        });

        recordsViewModel.getPosition().observe(getViewLifecycleOwner(), position -> {
            if (position == -1)
                binding.fragmentRecordStep1ContinueButton.setVisibility(View.INVISIBLE);
            else
                binding.fragmentRecordStep1ContinueButton.setVisibility(View.VISIBLE);
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

        binding.fragmentRecordStep1SelectFarmAutoCompleteTextView.setAdapter(farmAdapter);
        binding.fragmentRecordStep1SelectFarmAutoCompleteTextView.setOnItemClickListener((adapterView, view1, i, l) -> {
            farmId = farmList.get(i).getFarmId();

            if (farmId.isEmpty()) return;
            progressDialog.show();
            getBlocks(farmId);
        });

        binding.fragmentRecordStep1AvocadoVarietyIDontKnowRadioButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                idontKnowBottomSheetDialog.show(getChildFragmentManager(), "IDontKnowBottomSheetDialog");
            }
        });

        binding.fragmentRecordStep1BackButton.setOnClickListener(v ->
                Navigation.findNavController(v).popBackStack()
        );

        binding.fragmentRecordStep1ContinueButton.setOnClickListener(v ->
                {
                    if (recordsViewModel.getPosition().getValue() == null
                            || recordsViewModel.getPosition().getValue() == -1
                            || binding.fragmentRecordStep1AvocadoVarietyRadioGroup.getCheckedRadioButton() == null)
                        return;

                    setData();
                    Navigation.findNavController(view)
                            .navigate(R.id.action_record_navigation_record_step_1_to_record_step_2_fragment);
                }
        );
    }

    private void setData() {
        TokenManager tokenManager = new TokenManager(requireContext());
        String userId = tokenManager.getUserId();

        Data.farmName = recordsViewModel.getFarmBlockList().getValue().get(recordsViewModel.getPosition().getValue()).getName();
        Data.blockName = recordsViewModel.getFarmBlockList().getValue().get(recordsViewModel.getPosition().getValue()).getName();

        Data.farmerId = userId;
        Data.startDate = DateTimeManager.convertEpochToDate2(System.currentTimeMillis());
        Data.blockId = recordsViewModel.getFarmBlockList().getValue().get(recordsViewModel.getPosition().getValue()).getId();
        Data.dontKnowVariety = false;
        Data.dontKnowVarietyPhoto = null;
        Data.dontKnowVarietyNote = "";

        Data.variety = getVariety();
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
    public void onFarmBlockClick(FarmBlock farmBlock, int position) {
        // Deselect previous item
        if (recordsViewModel.getPosition().getValue() != null && recordsViewModel.getPosition().getValue() > -1) {
            Objects.requireNonNull(recordsViewModel.getFarmBlockList().getValue()).get(recordsViewModel.getPosition().getValue()).setSelected(false);
            farmBlockAdapter.notifyItemChanged(recordsViewModel.getPosition().getValue());
        }

        // Select new item
        recordsViewModel.setPosition(position);
        farmBlock.setSelected(!farmBlock.isSelected());
        farmBlockAdapter.notifyItemChanged(position);
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
            requireActivity().getContentResolver().takePersistableUriPermission(
                    resultUri,
                    Intent.FLAG_GRANT_READ_URI_PERMISSION
            );
        } else {
            resultUri = cameraImageUri;
        }

        try {
            PhotoFileView photoFileView = new PhotoFileView(requireContext());
            photoFileView.setDescription("Photo taken of the avocado variety");
            photoFileView.setImageUri(resultUri);
            photoFileView.setOnCancelClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    binding.fragmentRecordStep1IDontKnowLinearLayout.removeView(photoFileView);
                }
            });

            binding.fragmentRecordStep1IDontKnowLinearLayout.removeAllViews();
            binding.fragmentRecordStep1IDontKnowLinearLayout.addView(photoFileView);

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
                getFarms();
            }
        });
    }

    private void setupManageBlocks() {
        manageBlocksLauncher = registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
            if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                if (farmId.isEmpty()) return;
                progressDialog.show();
                getBlocks(farmId);
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

    private void getFarms() {
        TokenManager tokenManager = new TokenManager(requireContext());
        String accessToken = tokenManager.getAccessToken();

        AndroidNetworking.get(Constants.BASE_URL + Constants.GET_FARMS_URL)
                .addHeaders("Authorization", "Bearer " + accessToken)
                .addHeaders("Content-Type", "application/json")
                .setPriority(Priority.HIGH)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        Log.d("getFarms", response.toString());

                        try {
                            JSONArray farms = response.getJSONArray("results");
                            if (farms.length() == 0) {
                                progressDialog.dismiss();
                                Toast.makeText(requireContext(), "No farms found", Toast.LENGTH_SHORT).show();
                                addFarm();
                            } else {
                                Toast.makeText(requireContext(), "Farms loaded successfully", Toast.LENGTH_SHORT).show();
                                binding.fragmentRecordStep1NoFarmsLinearLayout.setVisibility(View.GONE);
                                binding.fragmentRecordStep1SelectFarmTextInputLayout.setVisibility(View.VISIBLE);

                                //List<Farm> farmsList = new ArrayList<>();
                                farmList.clear();
                                for (int i = 0; i < farms.length(); i++) {
                                    JSONObject farm = farms.getJSONObject(i);
                                    Farm farmObject = new Farm();
                                    farmObject.setFarmId(farm.getString("id"));
                                    farmObject.setFarmName(farm.getString("farm_name"));
                                    farmObject.setLocation(farm.getString("location"));
                                    farmObject.setNumberOfBlocks(farm.getInt("number_of_blocks"));
                                    farmObject.setTotalTrees(farm.getInt("total_trees"));
                                    farmList.add(farmObject);
                                }
                                //recordsViewModel.setFarmList(farmsList);
                                farmAdapter.notifyDataSetChanged();

                                if (!farmList.isEmpty()) {
                                    binding.fragmentRecordStep1SelectFarmAutoCompleteTextView.setText(farmList.get(0).toString(), false);
                                    farmId = farmList.get(0).getFarmId();
                                    getBlocks(farmId);
                                }
                            }
                        } catch (JSONException e) {
                            throw new RuntimeException(e);
                        }
                    }

                    @Override
                    public void onError(ANError anError) {
                        progressDialog.dismiss();
                        Toast.makeText(requireContext(), "Failed load farms", Toast.LENGTH_SHORT).show();
                        Log.d("getFarm", anError.toString());
                        Log.d("getFarm", anError.getErrorBody());
                        Log.d("getFarm", anError.getErrorCode() + "");
                    }
                });
    }

    private void getBlocks(String farmId) {
        TokenManager tokenManager = new TokenManager(requireContext());
        String accessToken = tokenManager.getAccessToken();

        AndroidNetworking.get(Constants.BASE_URL + Constants.GET_BLOCKS_URL)
                .addHeaders("Authorization", "Bearer " + accessToken)
                .addHeaders("Content-Type", "application/json")
                .setPriority(Priority.HIGH)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        progressDialog.dismiss();
                        Log.d("getBlock", response.toString());

                        try {
                            JSONArray blocks = response.getJSONArray("results");
                            if (blocks.length() == 0) {
                                Toast.makeText(requireContext(), "No blocks found", Toast.LENGTH_SHORT).show();
                                addBlock();
                            } else {
                                Toast.makeText(requireContext(), "Blocks loaded successfully", Toast.LENGTH_SHORT).show();
                                binding.fragmentRecordStep1NoFarmBlocksLinearLayout.setVisibility(View.GONE);

                                ArrayList<FarmBlock> blockArrayList = new ArrayList<>();
                                for (int i = 0; i < blocks.length(); i++) {
                                    JSONObject block = blocks.getJSONObject(i);
                                    if (!farmId.equals(block.getJSONObject("farm_name").getString("id")))
                                        continue;

                                    FarmBlock blockObject = new FarmBlock();
                                    blockObject.setId(block.getString("id"));
                                    blockObject.setName(block.getString("block_name"));
                                    blockObject.setNumberOfTrees(Integer.parseInt(block.getString("number_of_trees")));
                                    blockArrayList.add(blockObject);
                                }

                                recordsViewModel.setFarmBlockList(blockArrayList);

                            }
                        } catch (JSONException e) {
                            throw new RuntimeException(e);
                        }
                    }

                    @Override
                    public void onError(ANError anError) {
                        progressDialog.dismiss();
                        Toast.makeText(requireContext(), "Failed to load blocks", Toast.LENGTH_SHORT).show();
                        Log.d("getBlock", anError.toString());
                        Log.d("getBlock", anError.getErrorBody());
                        Log.d("getBlock", anError.getErrorCode() + "");
                    }
                });
    }
}
