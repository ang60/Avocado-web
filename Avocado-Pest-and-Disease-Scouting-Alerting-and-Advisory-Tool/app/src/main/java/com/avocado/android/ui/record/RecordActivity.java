package com.avocado.android.ui.record;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Toast;

import com.androidnetworking.AndroidNetworking;
import com.androidnetworking.error.ANError;
import com.androidnetworking.interfaces.JSONObjectRequestListener;
import com.avocado.android.R;
import com.avocado.android.data.model.Data;
import com.avocado.android.data.model.Farm;
import com.avocado.android.data.model.FarmBlock;
import com.avocado.android.databinding.ActivityRecordBinding;
import com.avocado.android.ui.views.ProgressDialog;
import com.avocado.android.utils.Config;
import com.avocado.android.utils.Constants;
import com.avocado.android.utils.FileManager;
import com.avocado.android.utils.TokenManager;
import com.google.android.gms.location.CurrentLocationRequest;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.Priority;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import androidx.activity.OnBackPressedCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.NavController;
import androidx.navigation.Navigation;
import androidx.navigation.fragment.NavHostFragment;

public class RecordActivity  extends AppCompatActivity {

    private RecordsViewModel recordsViewModel;
    private ActivityRecordBinding binding;
    private FusedLocationProviderClient fusedLocationClient;
    private ActivityResultLauncher<String[]> locationPermissionLauncher;
    private ProgressDialog progressDialog;

    private Gson gson;

    private boolean saveProgress = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        gson = new GsonBuilder().setPrettyPrinting().create();
        recordsViewModel = new ViewModelProvider(this).get(RecordsViewModel.class);
        binding = ActivityRecordBinding.inflate(getLayoutInflater());
        progressDialog = ProgressDialog.create(this, "Loading...");
        setContentView(binding.getRoot());

        NavHostFragment navHostFragment = (NavHostFragment) getSupportFragmentManager()
                .findFragmentById(R.id.nav_host_fragment_activity_record);

        NavController navController = navHostFragment.getNavController();

        Bundle args = new Bundle();
        if (getIntent() != null && getIntent().hasExtra("Record")) {
            String filePath = getIntent().getStringExtra("Record");
            if (filePath != null) args.putString("Record", filePath);
        }

        navController.setGraph(R.navigation.record_navigation, args);

        setupLocation();

        progressDialog.show();
        getFarms();

        getOnBackPressedDispatcher().addCallback(this,
                new OnBackPressedCallback(true) {
                    @Override
                    public void handleOnBackPressed() {
                        showAlertDialog();
                    }
                });
    }

    @Override
    protected void onStop() {
        super.onStop();

        if (!saveProgress) return;

        String directory = Config.getBaseDirectory() + "/records";
        String _fileName = recordsViewModel.data.farmName + "_" + recordsViewModel.data.blockName + "_" + recordsViewModel.data.startTimestamp;
        String fileName = Config.getFormattedString(_fileName, "[^a-zA-Z0-9-_]", "_") + ".json";
        String jsonString = gson.toJson(recordsViewModel.data);

        FileManager.saveJson(getApplicationContext(), directory, fileName, jsonString);
        saveDontKnowVarietyPhoto();
        Toast.makeText(this, "Progress saved", Toast.LENGTH_SHORT).show();
    }

    private void saveDontKnowVarietyPhoto() {
        try {
            String directory = Config.getBaseDirectory() + "/images";

            if (recordsViewModel.data.dontKnowVarietyPhoto == null) return;

            File file = recordsViewModel.data.dontKnowVarietyPhoto;
            FileManager.saveFile(getApplicationContext(), file, directory, file.getName());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void showAlertDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(RecordActivity.this);
        builder.setTitle("Exit");
        builder.setMessage("Are you sure you want to exit?");
        builder.setPositiveButton("Yes", (dialog, which) -> {
            finish();
        });

        builder.setNegativeButton("No", (dialog, which) -> {
            dialog.dismiss();
        });

        builder.setNeutralButton("Exit and Save Progress", (dialog, which) -> {
            dialog.dismiss();
            saveProgress = true;
            finish();
        });

        AlertDialog dialog = builder.create();
        dialog.show();
    }

    private void setupLocation() {
        locationPermissionLauncher = registerForActivityResult(new ActivityResultContracts.RequestMultiplePermissions(), result -> {
            Boolean fineLocationGranted = result.getOrDefault(Manifest.permission.ACCESS_FINE_LOCATION, false);
            if (Boolean.TRUE.equals(fineLocationGranted)) {
                getCurrentLocation();
            } else {
                Toast.makeText(this, "Location permission denied", Toast.LENGTH_SHORT).show();
            }
        });

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);
        checkPermissionsAndGetLocation();
    }

    private void checkPermissionsAndGetLocation() {

        if (ContextCompat.checkSelfPermission(this,
                Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            getCurrentLocation();
        } else {
            locationPermissionLauncher.launch(new String[]{ Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION });
        }
    }

    private void getCurrentLocation() {

        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(this,
                Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED)
            return;

        LocationRequest locationRequest = new LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY,
                5000).setMinUpdateIntervalMillis(2000).build();

        LocationCallback locationCallback = new LocationCallback() {
            @Override
            public void onLocationResult(LocationResult locationResult) {

                if (locationResult == null) return;
                Location location = locationResult.getLastLocation();

                if (location != null) {

                    double latitude = location.getLatitude();
                    double longitude = location.getLongitude();

                    recordsViewModel.data.gpsLatitude = String.valueOf(latitude);
                    recordsViewModel.data.gpsLongitude = String.valueOf(longitude);

                    fusedLocationClient.removeLocationUpdates(this);
                }
            }
        };

        fusedLocationClient.requestLocationUpdates(locationRequest, locationCallback, getMainLooper());
    }

    private void getFarms() {
        String directory = Config.getBaseDirectory() + "/farms";
        String fileName = "farms.json";

        File file = FileManager.getJsonFileInDirectory(getApplicationContext(), directory, fileName);
        String json = FileManager.readJsonFromFile(file);
        List<Farm> farmsList = gson.fromJson(json, new TypeToken<List<Farm>>() {}.getType());

        if (farmsList == null || farmsList.isEmpty()) {
            Toast.makeText(getApplicationContext(), "No farms found", Toast.LENGTH_SHORT).show();
        } else {
            Toast.makeText(getApplicationContext(), "Farms loaded successfully", Toast.LENGTH_SHORT).show();
            recordsViewModel.setFarmList(farmsList);
            getBlocks();
        }
    }

    private void getBlocks() {
        String directory = Config.getBaseDirectory() + "/blocks";
        String fileName = "blocks.json";

        File file = FileManager.getJsonFileInDirectory(getApplicationContext(), directory, fileName);
        String json = FileManager.readJsonFromFile(file);
        List<FarmBlock> blocksList = gson.fromJson(json, new TypeToken<List<FarmBlock>>() {}.getType());

        if (blocksList == null || blocksList.isEmpty()) {
            progressDialog.dismiss();
            Toast.makeText(getApplicationContext(), "No blocks found", Toast.LENGTH_SHORT).show();
        } else {
            progressDialog.dismiss();
            Toast.makeText(getApplicationContext(), "Blocks loaded successfully", Toast.LENGTH_SHORT).show();
            recordsViewModel.setFarmBlockList(blocksList);
        }
    }
}