package com.avocado.android.ui.managefarms;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Toast;

import com.androidnetworking.AndroidNetworking;
import com.androidnetworking.common.Priority;
import com.androidnetworking.error.ANError;
import com.androidnetworking.interfaces.JSONObjectRequestListener;
import com.androidnetworking.interfaces.StringRequestListener;
import com.avocado.android.R;
import com.avocado.android.data.model.Farm;
import com.avocado.android.databinding.ActivityManageFarmsBinding;
import com.avocado.android.ui.start.StartActivity;
import com.avocado.android.ui.views.ProgressDialog;
import com.avocado.android.utils.Config;
import com.avocado.android.utils.Constants;
import com.avocado.android.utils.FileManager;
import com.avocado.android.utils.TokenManager;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.navigation.Navigation;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

public class ManageFarmsActivity extends AppCompatActivity implements FarmsAdapter.FarmListener, AddNewFarmBottomSheetDialog.AddNewFarmListener, EditFarmBottomSheetDialog.EditFarmListener {

    private ActivityManageFarmsBinding binding;
    private FarmsAdapter farmAdapter;
    private ProgressDialog progressDialog;
    private AddNewFarmBottomSheetDialog addNewFarmBottomSheetDialog;
    private EditFarmBottomSheetDialog editFarmBottomSheetDialog;
    private Gson gson;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        gson = new GsonBuilder().setPrettyPrinting().create();
        binding = ActivityManageFarmsBinding.inflate(getLayoutInflater());
        progressDialog = ProgressDialog.create(this, "Loading...");
        addNewFarmBottomSheetDialog = new AddNewFarmBottomSheetDialog();
        editFarmBottomSheetDialog = new EditFarmBottomSheetDialog();

        setContentView(binding.getRoot());

        addNewFarmBottomSheetDialog.setListener(this);
        editFarmBottomSheetDialog.setListener(this);

        binding.activityManageFarmsAddNewFarmButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                addNewFarmBottomSheetDialog.show(getSupportFragmentManager(), "AddNewFarmBottomSheetDialog");
            }
        });

        checkTokenExpired();

        setupRecyclerView();

        progressDialog.show();
        getFarms();

        getOnBackPressedDispatcher().addCallback(this,
                new OnBackPressedCallback(true) {
                    @Override
                    public void handleOnBackPressed() {

                        Intent resultIntent = new Intent();
                        resultIntent.putExtra("Reload", true);

                        setResult(RESULT_OK, resultIntent);
                        finish();
                    }
                });
    }

    @Override
    public void onFarmClick(Farm farm, int position) {

    }

    @Override
    public void onFarmEditClick(Farm farm, int position) {
        Bundle args = new Bundle();
        args.putString("farmId", farm.getFarmId());
        args.putString("farmName", farm.getFarmName());
        args.putString("location", farm.getLocation());
        args.putString("numberOfBlocks", String.valueOf(farm.getNumberOfBlocks()));
        args.putString("farmSize", String.valueOf(farm.getFarmSize()));

        editFarmBottomSheetDialog.setArguments(args);
        editFarmBottomSheetDialog.show(getSupportFragmentManager(), "EditFarmBottomSheetDialog");
    }

    @Override
    public void onFarmDeleteClick(Farm farm, int position) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Delete Farm");
        builder.setMessage("Are you sure you want to delete this farm?");
        builder.setPositiveButton("Yes", (dialog, which) -> {
            deleteFarm(farm.getFarmId());
            dialog.dismiss();
            progressDialog.show();
        });
        builder.setNegativeButton("No", (dialog, which) -> {
            dialog.dismiss();
        });
        builder.show();
    }

    @Override
    public void onAddNewFarm(String farmName, String location, String numberOfBlocks, String farmSize) {
        if (farmName.isEmpty() || location.isEmpty() || numberOfBlocks.isEmpty() || farmSize.isEmpty()) {
            Toast.makeText(this, "Please fill in all fields", Toast.LENGTH_SHORT).show();
            return;
        }

        progressDialog.show();
        addFarm(farmName, location, numberOfBlocks, farmSize);
    }

    @Override
    public void onEditFarm(String farmId, String farmName, String location, String numberOfBlocks, String farmSize) {
        if (farmName.isEmpty() || location.isEmpty() || numberOfBlocks.isEmpty() || farmSize.isEmpty()) {
            Toast.makeText(this, "Please fill in all fields", Toast.LENGTH_SHORT).show();
            return;
        }

        progressDialog.show();
        editFarm(farmId, farmName, location, numberOfBlocks, farmSize);
    }

    private void setupRecyclerView() {
        farmAdapter = new FarmsAdapter(this);
        RecyclerView rv = binding.activityManageFarmsRecyclerView;

        rv.setLayoutManager(new LinearLayoutManager(this));
        rv.setAdapter(farmAdapter);
    }

    private void checkTokenExpired() {
        TokenManager tokenManager = new TokenManager(getApplicationContext());
        if (tokenManager.isTokenExpired()) {
            tokenManager.clearTokens();
            tokenManager.clearUserData();

            Intent intent = new Intent(getApplicationContext(), StartActivity.class);
            startActivity(intent);
            finish();
        }
    }

    public void addFarm(String farmName, String location, String numberOfBlocks, String farmSize) {
        TokenManager tokenManager = new TokenManager(getApplicationContext());
        String accessToken = tokenManager.getAccessToken();
        String userId = tokenManager.getUserId();

        JSONObject body = new JSONObject();
        try {
            body.put("farmer_name_id", userId);
            body.put("farm_name", farmName);
            body.put("location", location);
            body.put("number_of_blocks", numberOfBlocks);
            body.put("farm_size", farmSize);
        } catch (JSONException e) {
            Log.e("addFarm", e.toString());
            return;
        }

        AndroidNetworking.post(Constants.BASE_URL + Constants.ADD_FARM_URL)
                .addHeaders("Authorization", "Bearer " + accessToken)
                .addHeaders("Content-Type", "application/json")
                .addJSONObjectBody(body)
                .setPriority(Priority.HIGH)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        Toast.makeText(getApplicationContext(), "Farm added successfully", Toast.LENGTH_SHORT).show();
                        Log.d("addFarm", response.toString());

                        getFarms();
                    }

                    @Override
                    public void onError(ANError anError) {
                        progressDialog.dismiss();
                        Toast.makeText(getApplicationContext(), "Failed to add farm", Toast.LENGTH_SHORT).show();
                        Log.d("addFarm", anError.toString());
                        Log.d("addFarm", anError.getErrorBody());
                        Log.d("addFarm", anError.getErrorCode() + "");
                    }
                });
    }

    public void getFarms() {
        TokenManager tokenManager = new TokenManager(getApplicationContext());
        String accessToken = tokenManager.getAccessToken();
        String directory = Config.getBaseDirectory() + "/farms";
        String fileName = "farms.json";

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
                            List<Farm> farmsArrayList = new ArrayList<>();

                            if (farms.length() == 0) {
                                Toast.makeText(getApplicationContext(), "No farms found", Toast.LENGTH_SHORT).show();
                            } else {
                                Toast.makeText(getApplicationContext(), "Farms loaded successfully", Toast.LENGTH_SHORT).show();

                                for (int i = 0; i < farms.length(); i++) {
                                    JSONObject farm = farms.getJSONObject(i);
                                    Farm farmObject = new Farm();
                                    farmObject.setFarmId(farm.getString("id"));
                                    farmObject.setFarmName(farm.getString("farm_name"));
                                    farmObject.setLocation(farm.getString("location"));
                                    farmObject.setNumberOfBlocks(farm.getInt("number_of_blocks"));
                                    farmObject.setFarmSize(farm.getDouble("farm_size"));
                                    farmsArrayList.add(farmObject);
                                }
                            }

                            farmAdapter.setFarmList(farmsArrayList);
                            farmAdapter.setFarmListFull(farmsArrayList);

                            FileManager.saveJson(getApplicationContext(), directory, fileName, gson.toJson(farmsArrayList));
                            progressDialog.dismiss();

                        } catch (JSONException e) {
                            throw new RuntimeException(e);
                        }
                    }

                    @Override
                    public void onError(ANError anError) {
                        progressDialog.dismiss();
                        Toast.makeText(getApplicationContext(), "Failed load farms", Toast.LENGTH_SHORT).show();
                        Log.d("getFarm", anError.toString());
                        Log.d("getFarm", anError.getErrorBody());
                        Log.d("getFarm", anError.getErrorCode() + "");
                    }
                });
    }

    public void editFarm(String farmId, String farmName, String location, String numberOfBlocks, String farmSize) {
        TokenManager tokenManager = new TokenManager(getApplicationContext());
        String accessToken = tokenManager.getAccessToken();
        String userId = tokenManager.getUserId();

        JSONObject body = new JSONObject();
        try {
            body.put("farmer_name_id", userId);
            body.put("farm_name", farmName);
            body.put("location", location);
            body.put("number_of_blocks", numberOfBlocks);
            body.put("farm_size", farmSize);
        } catch (JSONException e) {
            Log.e("editFarm", e.toString());
            return;
        }

        AndroidNetworking.put(Constants.BASE_URL + Constants.UPDATE_FARM_URL)
                .addHeaders("Authorization", "Bearer " + accessToken)
                .addHeaders("Content-Type", "application/json")
                .addPathParameter("id", farmId)
                .addJSONObjectBody(body)
                .setPriority(Priority.HIGH)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        Toast.makeText(getApplicationContext(), "Farm updated successfully", Toast.LENGTH_SHORT).show();
                        Log.d("editFarm", response.toString());

                        getFarms();
                    }

                    @Override
                    public void onError(ANError anError) {
                        progressDialog.dismiss();
                        Toast.makeText(getApplicationContext(), "Failed to update farm", Toast.LENGTH_SHORT).show();
                        Log.d("editFarm", anError.toString());
                        Log.d("editFarm", anError.getErrorBody());
                        Log.d("editFarm", anError.getErrorCode() + "");
                    }
                });
    }

    public void deleteFarm(String farmId) {
        TokenManager tokenManager = new TokenManager(getApplicationContext());
        String accessToken = tokenManager.getAccessToken();

        AndroidNetworking.delete(Constants.BASE_URL + Constants.UPDATE_FARM_URL)
                .addHeaders("Authorization", "Bearer " + accessToken)
                .addHeaders("Content-Type", "application/json")
                .addPathParameter("id", farmId)
                .setPriority(Priority.HIGH)
                .build()
                .getAsString(new StringRequestListener() {
                    @Override
                    public void onResponse(String s) {
                        Toast.makeText(getApplicationContext(), "Farm deleted successfully", Toast.LENGTH_SHORT).show();
                        Log.d("deleteFarm", s);

                        getFarms();
                    }

                    @Override
                    public void onError(ANError anError) {
                        progressDialog.dismiss();
                        Toast.makeText(getApplicationContext(), "Failed to delete farm", Toast.LENGTH_SHORT).show();
                        Log.d("deleteFarm", anError.toString());
                        Log.d("deleteFarm", anError.getErrorBody());
                        Log.d("deleteFarm", anError.getErrorCode() + "");
                    }
                });
    }
}