package com.avocado.android.ui.start.otp;

import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import com.androidnetworking.AndroidNetworking;
import com.androidnetworking.common.Priority;
import com.androidnetworking.error.ANError;
import com.androidnetworking.interfaces.JSONObjectRequestListener;
import com.avocado.android.App;
import com.avocado.android.R;
import com.avocado.android.data.model.Farm;
import com.avocado.android.data.model.FarmBlock;
import com.avocado.android.databinding.FragmentStartOtpBinding;
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
import java.util.concurrent.TimeUnit;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;

public class OtpFragment extends Fragment {

    private FragmentStartOtpBinding binding;
    private ProgressDialog progressDialog;
    private Gson gson;

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {

        binding = FragmentStartOtpBinding.inflate(inflater, container, false);
        gson = new GsonBuilder().setPrettyPrinting().create();

        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        setupProgressDialog();
        setUpListeners(view);

        if (getArguments() != null) {
            String phoneNumber = getArguments().getString("phone_number");
            binding.fragmentStartOtpSubtitleText.setText("Enter the code sent to " + phoneNumber);
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }

    private void setupProgressDialog() {
        progressDialog = ProgressDialog.create(requireContext(), "Loading...");
    }

    private void setUpListeners(View view) {
        binding.fragmentStartOtpContinueButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                JSONObject body = new JSONObject();

                // Read navigation arguments
                if (getArguments() != null) {
                    String phoneNumber = getArguments().getString("phone_number");
                    try {
                        body.put("phone_number", phoneNumber);
                        body.put("code", binding.fragmentStartOtpPhoneNumberTextInputEditText.getText().toString());

                        if (!getArguments().getString("first_name", "").isEmpty()
                                && !getArguments().getString("last_name", "").isEmpty()
                                && !getArguments().getString("county", "").isEmpty()) {
                            verifyOtpAndRegister(body, view);
                        } else {
                            verifyOtp(body, view);
                        }

                    } catch (JSONException e) {
                        throw new RuntimeException(e);
                    }
                }
            }
        });
    }

    private void savePreferences(JSONObject response) {
        try {
            TokenManager tokenManager = new TokenManager(requireContext());

            String accessToken = response.getString("access");
            String refreshToken = response.getString("refresh");
            String id = response.getJSONObject("user").getString("id");
            String firstName = response.getJSONObject("user").getString("first_name");
            String lastName = response.getJSONObject("user").getString("last_name");
            String email = response.getJSONObject("user").getString("email");
            String phoneNumber = response.getJSONObject("user").getString("phone_number");
            String role = response.getJSONObject("user").getString("role");
            String county = response.getJSONObject("user").getString("county");
            String profilePicture = response.getJSONObject("user").getString("profile_picture");

            tokenManager.saveTimeToLive(System.currentTimeMillis() + TimeUnit.HOURS.toMillis(24)); // Add 24 hours to current time
            tokenManager.saveAccessToken(accessToken);
            tokenManager.saveRefreshToken(refreshToken);
            tokenManager.saveUserData(id, firstName, lastName, email, phoneNumber, role, county, profilePicture);

            App.setUserId(id);

        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    private void verifyOtp(JSONObject body, View view) {
        progressDialog.show();

        AndroidNetworking.post(Constants.BASE_URL + Constants.VERIFY_OTP_URL)
                .addJSONObjectBody(body)
                .setPriority(Priority.HIGH)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        progressDialog.dismiss();
                        Log.d("OtpFragment Response", response.toString());
                        savePreferences(response);
                        getFarms(view);
                    }

                    @Override
                    public void onError(ANError anError) {
                        progressDialog.dismiss();
                        Log.e("OtpFragment Error Body", anError.getErrorBody());
                        Log.e("OtpFragment Error Code", "" + anError.getErrorCode());

                        Toast.makeText(requireContext(), "Failed to verify", Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void verifyOtpAndRegister(JSONObject body, View view) {
        progressDialog.show();

        AndroidNetworking.post(Constants.BASE_URL + Constants.VERIFY_OTP_URL)
                .addJSONObjectBody(body)
                .setPriority(Priority.HIGH)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        savePreferences(response);
                        Log.d("Register OtpFragment Response", response.toString());

                        updateUserData(view,
                                getArguments().getString("first_name"),
                                getArguments().getString("last_name"),
                                getArguments().getString("county"),
                                getArguments().getString("phone_number"));
                    }

                    @Override
                    public void onError(ANError anError) {
                        progressDialog.dismiss();
                        Log.e("OtpFragment Error Body", anError.getErrorBody());
                        Log.e("OtpFragment Error Code", "" + anError.getErrorCode());

                        Toast.makeText(requireContext(), "Error", Toast.LENGTH_SHORT).show();
                    }
                });
    }

    public void updateUserData(View view, String firstName, String lastName, String location, String phoneNumber) {
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
            Log.e("OtpUpdateUserData", e.toString());
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

                        progressDialog.dismiss();
                        Toast.makeText(requireContext(), "Registered successfully", Toast.LENGTH_SHORT).show();
                        Log.d("OtpUpdateUserData", response.toString());
                        Navigation.findNavController(view).navigate(R.id.action_start_navigation_otp_to_success_fragment);
                    }

                    @Override
                    public void onError(ANError anError) {
                        progressDialog.dismiss();
                        Toast.makeText(requireContext(), "Failed to register", Toast.LENGTH_SHORT).show();
                        Log.d("OtpUpdateUserData", anError.toString());
                        Log.d("OtpUpdateUserData", anError.getErrorBody());
                        Log.d("OtpUpdateUserData", anError.getErrorCode() + "");
                    }
                });
    }

    private void getFarms(View view) {
        TokenManager tokenManager = new TokenManager(requireContext());
        String accessToken = tokenManager.getAccessToken();
        String directory = Config.getBaseDirectory() + "/farms";
        String fileName = "farms.json";

        AndroidNetworking.get(Constants.BASE_URL + Constants.GET_FARMS_URL)
                .addHeaders("Authorization", "Bearer " + accessToken)
                .addHeaders("Content-Type", "application/json")
                .setPriority(com.androidnetworking.common.Priority.HIGH)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        Log.d("getFarms", response.toString());

                        try {
                            List<Farm> farmsList = new ArrayList<>();
                            JSONArray farms = response.getJSONArray("results");

                            for (int i = 0; i < farms.length(); i++) {
                                JSONObject farm = farms.getJSONObject(i);
                                Farm farmObject = new Farm();
                                farmObject.setFarmId(farm.getString("id"));
                                farmObject.setFarmName(farm.getString("farm_name"));
                                farmObject.setLocation(farm.getString("location"));
                                farmObject.setNumberOfBlocks(farm.getInt("number_of_blocks"));
                                farmObject.setFarmSize(farm.getDouble("farm_size"));

                                farmsList.add(farmObject);
                            }

                            FileManager.saveJson(requireContext(), directory, fileName, gson.toJson(farmsList));
                            getBlocks(view); // Call getBlocks after getting farms

                        } catch (JSONException e) {
                            throw new RuntimeException(e);
                        }
                    }

                    @Override
                    public void onError(ANError anError) {
                        Log.d("getFarm", anError.toString());
                        Log.d("getFarm", anError.getErrorBody());
                        Log.d("getFarm", anError.getErrorCode() + "");

                        progressDialog.dismiss();
                        Navigation.findNavController(view).navigate(R.id.action_start_navigation_otp_to_success_fragment);
                    }
                });
    }

    private void getBlocks(View view) {
        TokenManager tokenManager = new TokenManager(requireContext());
        String accessToken = tokenManager.getAccessToken();
        String directory = Config.getBaseDirectory() + "/blocks";
        String fileName = "blocks.json";

        AndroidNetworking.get(Constants.BASE_URL + Constants.GET_BLOCKS_URL)
                .addHeaders("Authorization", "Bearer " + accessToken)
                .addHeaders("Content-Type", "application/json")
                .setPriority(com.androidnetworking.common.Priority.HIGH)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        Log.d("getBlock", response.toString());

                        try {
                            List<FarmBlock> blocksList = new ArrayList<>();
                            JSONArray blocks = response.getJSONArray("results");

                            for (int i = 0; i < blocks.length(); i++) {
                                JSONObject block = blocks.getJSONObject(i);
                                FarmBlock blockObject = new FarmBlock();
                                blockObject.setId(block.getString("id"));
                                blockObject.setFarmId(block.getJSONObject("farm_name").getString("id"));
                                blockObject.setFarmName(block.getJSONObject("farm_name").getString("farm_name"));
                                blockObject.setLocation(block.getJSONObject("farm_name").getString("location"));
                                blockObject.setName(block.getString("block_name"));
                                blockObject.setNumberOfTrees(Integer.parseInt(block.getString("number_of_trees")));

                                blocksList.add(blockObject);
                            }

                            FileManager.saveJson(requireContext(), directory, fileName, gson.toJson(blocksList));
                            progressDialog.dismiss();
                            Navigation.findNavController(view).navigate(R.id.action_start_navigation_otp_to_success_fragment);

                        } catch (JSONException e) {
                            throw new RuntimeException(e);
                        }
                    }

                    @Override
                    public void onError(ANError anError) {
                        Log.d("getBlock", anError.toString());
                        Log.d("getBlock", anError.getErrorBody());
                        Log.d("getBlock", anError.getErrorCode() + "");

                        progressDialog.dismiss();
                        Navigation.findNavController(view).navigate(R.id.action_start_navigation_otp_to_success_fragment);
                    }
                });
    }
}