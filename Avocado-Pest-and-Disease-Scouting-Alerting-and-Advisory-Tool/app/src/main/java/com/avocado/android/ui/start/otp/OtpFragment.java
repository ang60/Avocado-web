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
import com.avocado.android.R;
import com.avocado.android.databinding.FragmentStartOtpBinding;
import com.avocado.android.ui.views.ProgressDialog;
import com.avocado.android.utils.Constants;
import com.avocado.android.utils.TokenManager;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.concurrent.TimeUnit;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;

public class OtpFragment extends Fragment {

    private FragmentStartOtpBinding binding;
    private ProgressDialog progressDialog;

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {

        binding = FragmentStartOtpBinding.inflate(inflater, container, false);
        View root = binding.getRoot();

        return root;
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

            tokenManager.saveTimeToLive(System.currentTimeMillis() + TimeUnit.HOURS.toMillis(24)); // Add 24 hours to current time
            tokenManager.saveAccessToken(accessToken);
            tokenManager.saveRefreshToken(refreshToken);
            tokenManager.saveUserData(id, firstName, lastName, email, phoneNumber, role, county);

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
                        savePreferences(response);
                        progressDialog.dismiss();
                        Log.d("OtpFragment Response", response.toString());
                        Navigation.findNavController(view).navigate(R.id.action_start_navigation_otp_to_success_fragment);
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
}