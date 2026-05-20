package com.avocado.android.ui.manageblocks;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Toast;

import com.androidnetworking.AndroidNetworking;
import com.androidnetworking.common.Priority;
import com.androidnetworking.error.ANError;
import com.androidnetworking.interfaces.JSONObjectRequestListener;
import com.androidnetworking.interfaces.StringRequestListener;
import com.avocado.android.data.model.Block;
import com.avocado.android.data.model.Farm;
import com.avocado.android.databinding.ActivityManageBlocksBinding;
import com.avocado.android.ui.managefarms.FarmsAdapter;
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
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

public class ManageBlocksActivity extends AppCompatActivity implements BlocksAdapter.BlockListener, AddNewBlockBottomSheetDialog.AddNewBlockListener, EditBlockBottomSheetDialog.EditBlockListener {

    private ActivityManageBlocksBinding binding;
    private BlocksAdapter blockAdapter;
    private ProgressDialog progressDialog;
    private AddNewBlockBottomSheetDialog addNewBlockBottomSheetDialog;
    private EditBlockBottomSheetDialog editBlockBottomSheetDialog;
    private Gson gson;

    private int selectedFarmPosition = -1;
    private ArrayList<Farm> farmsArrayList = new ArrayList<>();
    private ArrayAdapter<Farm> farmAdapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        gson = new GsonBuilder().setPrettyPrinting().create();
        binding = ActivityManageBlocksBinding.inflate(getLayoutInflater());
        progressDialog = ProgressDialog.create(this, "Loading...");
        addNewBlockBottomSheetDialog = new AddNewBlockBottomSheetDialog();
        editBlockBottomSheetDialog = new EditBlockBottomSheetDialog();
        farmAdapter = new ArrayAdapter<>(this, android.R.layout.simple_list_item_1, farmsArrayList);

        setContentView(binding.getRoot());

        addNewBlockBottomSheetDialog.setListener(this);
        editBlockBottomSheetDialog.setListener(this);

        binding.activityManageBlocksFarmNameAutoCompleteTextView.setAdapter(farmAdapter);
        binding.activityManageBlocksFarmNameAutoCompleteTextView.setOnItemClickListener((adapterView, view, i, l) -> {
            selectedFarmPosition = i;
            getBlocks(farmsArrayList.get(i).getFarmId());
        });

        binding.activityManageBlocksAddNewBlockButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                addNewBlockBottomSheetDialog.show(getSupportFragmentManager(), "AddNewBlockBottomSheetDialog");
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
    public void onBlockClick(Block block, int position) {

    }

    @Override
    public void onBlockEditClick(Block block, int position) {
        Bundle args = new Bundle();
        args.putString("blockId", block.getBlockId());
        args.putString("blockName", block.getBlockName());
        args.putString("numberOfTrees", block.getNumberOfTrees());
        editBlockBottomSheetDialog.setArguments(args);
        editBlockBottomSheetDialog.show(getSupportFragmentManager(), "EditBlockBottomSheetDialog");
    }

    @Override
    public void onBlockDeleteClick(Block block, int position) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Delete Block");
        builder.setMessage("Are you sure you want to delete this block?");
        builder.setPositiveButton("Yes", (dialog, which) -> {
            deleteBlock(block.getBlockId());
            dialog.dismiss();
            progressDialog.show();
        });
        builder.setNegativeButton("No", (dialog, which) -> {
            dialog.dismiss();
        });
        builder.show();
    }

    @Override
    public void onAddNewBlock(String blockName, String numberOfTrees) {
        if (selectedFarmPosition == -1) {
            Toast.makeText(this, "Please select a farm", Toast.LENGTH_SHORT).show();
            return;
        }

        if (blockName.isEmpty() || numberOfTrees.isEmpty()) {
            Toast.makeText(this, "Please fill in all fields", Toast.LENGTH_SHORT).show();
            return;
        }
        progressDialog.show();
        addBlock(blockName, numberOfTrees);
    }

    @Override
    public void onEditBlock(String blockId, String blockName, String numberOfTrees) {
        if (selectedFarmPosition == -1) {
            Toast.makeText(this, "Please select a farm", Toast.LENGTH_SHORT).show();
            return;
        }

        if (blockName.isEmpty() || numberOfTrees.isEmpty()) {
            Toast.makeText(this, "Please fill in all fields", Toast.LENGTH_SHORT).show();
            return;
        }
        progressDialog.show();
        editBlock(blockId, blockName, numberOfTrees);
    }

    private void setTotalBlocks() {
        int totalBlocks = 0;
        for (Farm farm : farmsArrayList) {
            totalBlocks += farm.getNumberOfBlocks();
        }
        binding.activityManageBlocksTotalBlocksTextView.setText(String.valueOf(totalBlocks));
    }

    private void setTotalTrees() {
        double totalFarmSize = 0;
        for (Farm farm : farmsArrayList) {
            totalFarmSize += farm.getFarmSize();
        }
        binding.activityManageBlocksTotalFarmSizeTextView.setText(String.valueOf(totalFarmSize));
    }

    private void setupRecyclerView() {
        blockAdapter = new BlocksAdapter(this);
        RecyclerView rv = binding.activityManageBlocksFarmBlocksRecyclerView;

        rv.setLayoutManager(new LinearLayoutManager(this));
        rv.setAdapter(blockAdapter);
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

    private void getFarms() {
        TokenManager tokenManager = new TokenManager(getApplicationContext());
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
                            farmsArrayList.clear();

                            if (farms.length() == 0) {
                                progressDialog.dismiss();
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

                            farmAdapter.notifyDataSetChanged();

                            setTotalBlocks();
                            setTotalTrees();

                            if (!farmsArrayList.isEmpty()) {
                                selectedFarmPosition = 0;
                                binding.activityManageBlocksFarmNameAutoCompleteTextView.setText(farmsArrayList.get(0).toString(), false);
                                getBlocks(farmsArrayList.get(0).getFarmId());
                            }
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

    public void addBlock(String blockName, String numberOfTrees) {
        TokenManager tokenManager = new TokenManager(getApplicationContext());
        String accessToken = tokenManager.getAccessToken();
        String userId = tokenManager.getUserId();

        JSONObject body = new JSONObject();
        try {
            body.put("farmer_id", userId);
            body.put("farm_name_id", farmsArrayList.get(selectedFarmPosition).getFarmId());
            body.put("block_name", blockName);
            body.put("number_of_trees", numberOfTrees);
        } catch (JSONException e) {
            Log.e("addBlock", e.toString());
            return;
        }

        AndroidNetworking.post(Constants.BASE_URL + Constants.ADD_BLOCK_URL)
                .addHeaders("Authorization", "Bearer " + accessToken)
                .addHeaders("Content-Type", "application/json")
                .addJSONObjectBody(body)
                .setPriority(Priority.HIGH)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        Toast.makeText(getApplicationContext(), "Block added successfully", Toast.LENGTH_SHORT).show();
                        Log.d("addBlock", response.toString());

                        getBlocks(farmsArrayList.get(selectedFarmPosition).getFarmId());
                    }

                    @Override
                    public void onError(ANError anError) {
                        progressDialog.dismiss();
                        Toast.makeText(getApplicationContext(), "Failed to add block", Toast.LENGTH_SHORT).show();
                        Log.d("addBlock", anError.toString());
                        Log.d("addBlock", anError.getErrorBody());
                        Log.d("addBlock", anError.getErrorCode() + "");
                    }
                });
    }

    private void getBlocks(String farmId) {
        TokenManager tokenManager = new TokenManager(getApplicationContext());
        String accessToken = tokenManager.getAccessToken();
        String directory = Config.getBaseDirectory() + "/blocks";
        String fileName = "blocks.json";

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
                            List<Block> blockArrayList = new ArrayList<>();

                            if (blocks.length() == 0) {
                                Toast.makeText(getApplicationContext(), "No blocks found", Toast.LENGTH_SHORT).show();
                            } else {
                                Toast.makeText(getApplicationContext(), "Blocks loaded successfully", Toast.LENGTH_SHORT).show();

                                for (int i = 0; i < blocks.length(); i++) {
                                    JSONObject block = blocks.getJSONObject(i);
                                    if (!farmId.equals(block.getJSONObject("farm_name").getString("id")))
                                        continue;

                                    Block blockObject = new Block();
                                    blockObject.setBlockId(block.getString("id"));
                                    blockObject.setBlockName(block.getString("block_name"));
                                    blockObject.setNumberOfTrees(block.getString("number_of_trees"));
                                    blockArrayList.add(blockObject);
                                }
                            }

                            blockAdapter.setBlockList(blockArrayList);
                            blockAdapter.setBlockListFull(blockArrayList);

                            FileManager.saveJson(getApplicationContext(), directory, fileName, gson.toJson(blockArrayList));
                            progressDialog.dismiss();

                        } catch (JSONException e) {
                            throw new RuntimeException(e);
                        }
                    }

                    @Override
                    public void onError(ANError anError) {
                        progressDialog.dismiss();
                        Toast.makeText(getApplicationContext(), "Failed load blocks", Toast.LENGTH_SHORT).show();
                        Log.d("getBlock", anError.toString());
                        Log.d("getBlock", anError.getErrorBody());
                        Log.d("getBlock", anError.getErrorCode() + "");
                    }
                });
    }

    public void editBlock(String blockId, String blockName, String numberOfTrees) {
        TokenManager tokenManager = new TokenManager(getApplicationContext());
        String accessToken = tokenManager.getAccessToken();
        String userId = tokenManager.getUserId();

        JSONObject body = new JSONObject();
        try {
            body.put("farmer_id", userId);
            body.put("farm_name_id", farmsArrayList.get(selectedFarmPosition).getFarmId());
            body.put("block_name", blockName);
            body.put("number_of_trees", numberOfTrees);
        } catch (JSONException e) {
            Log.e("addBlock", e.toString());
            return;
        }

        AndroidNetworking.put(Constants.BASE_URL + Constants.UPDATE_BLOCK_URL)
                .addHeaders("Authorization", "Bearer " + accessToken)
                .addHeaders("Content-Type", "application/json")
                .addPathParameter("id", blockId)
                .addJSONObjectBody(body)
                .setPriority(Priority.HIGH)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        Toast.makeText(getApplicationContext(), "Block updated successfully", Toast.LENGTH_SHORT).show();
                        Log.d("editBlock", response.toString());

                        getBlocks(farmsArrayList.get(selectedFarmPosition).getFarmId());
                    }

                    @Override
                    public void onError(ANError anError) {
                        progressDialog.dismiss();
                        Toast.makeText(getApplicationContext(), "Failed to update block", Toast.LENGTH_SHORT).show();
                        Log.d("editBlock", anError.toString());
                        Log.d("editBlock", anError.getErrorBody());
                        Log.d("editBlock", anError.getErrorCode() + "");
                    }
                });
    }

    public void deleteBlock(String blockId) {
        TokenManager tokenManager = new TokenManager(getApplicationContext());
        String accessToken = tokenManager.getAccessToken();

        AndroidNetworking.delete(Constants.BASE_URL + Constants.UPDATE_BLOCK_URL)
                .addHeaders("Authorization", "Bearer " + accessToken)
                .addHeaders("Content-Type", "application/json")
                .addPathParameter("id", blockId)
                .setPriority(Priority.HIGH)
                .build()
                .getAsString(new StringRequestListener() {
                    @Override
                    public void onResponse(String s) {
                        Toast.makeText(getApplicationContext(), "Block deleted successfully", Toast.LENGTH_SHORT).show();
                        Log.d("deleteBlock", s);

                        getBlocks(farmsArrayList.get(selectedFarmPosition).getFarmId());
                    }

                    @Override
                    public void onError(ANError anError) {
                        progressDialog.dismiss();
                        Toast.makeText(getApplicationContext(), "Failed to delete block", Toast.LENGTH_SHORT).show();
                        Log.d("deleteBlock", anError.toString());
                        Log.d("deleteBlock", anError.getErrorBody());
                        Log.d("deleteBlock", anError.getErrorCode() + "");
                    }
                });
    }
}