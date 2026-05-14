package com.avocado.android.ui.start.login;

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
import com.avocado.android.databinding.FragmentStartLoginBinding;
import com.avocado.android.ui.views.ProgressDialog;
import com.avocado.android.utils.Constants;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Objects;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;

public class LoginFragment extends Fragment {

    private FragmentStartLoginBinding binding;
    private ProgressDialog progressDialog;

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {

        binding = FragmentStartLoginBinding.inflate(inflater, container, false);
        View root = binding.getRoot();

        return root;
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        setupProgressDialog();
        setUpListeners(view);
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
        binding.fragmentStartLoginContinueButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (Objects.requireNonNull(binding.fragmentStartLoginPhoneNumberTextInputEditText.getText()).toString().length() != 9) {
                    Toast.makeText(requireContext(), "Invalid phone number", Toast.LENGTH_SHORT).show();
                    return;
                }

                if (getArguments() != null) {
                    progressDialog.show();
                    //createAccount(view);
                    registerWithoutPassword(view);
                } else {
                    progressDialog.show();
                    login(view);
                }
            }
        });
    }

    private void createAccount(View view) {
        JSONObject body = new JSONObject();
        try {
            body.put("first_name", getArguments().getString("first_name"));
            body.put("last_name", getArguments().getString("last_name"));
            body.put("county", getArguments().getString("county"));
            body.put("email", getArguments().getString("email"));
            body.put("phone_number", "+254" + binding.fragmentStartLoginPhoneNumberTextInputEditText.getText().toString());
            body.put("role", getArguments().getString("role"));
            body.put("password", getArguments().getString("password"));
            body.put("entity", "");
            register(body, view);
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    private void login(View view) {
        JSONObject body = new JSONObject();
        try {
            body.put("phone_number", "+254" + binding.fragmentStartLoginPhoneNumberTextInputEditText.getText().toString());
            body.put("email", "");
            requestOtp(body, view);
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    private void requestOtp(JSONObject body, View view) {
        AndroidNetworking.post(Constants.BASE_URL + Constants.REQUEST_OTP_URL)
                .addJSONObjectBody(body)
                .setPriority(Priority.HIGH)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        progressDialog.dismiss();
                        Log.d("LoginFragment RequestOtp Response", response.toString());

                        try {
                            Toast.makeText(requireContext(), response.getString("message"), Toast.LENGTH_SHORT).show();

                            Bundle args = new Bundle();

                            if (getArguments() != null)
                                args.putAll(getArguments());

                            args.putString("phone_number", body.getString("phone_number"));
                            Navigation.findNavController(view).navigate(R.id.action_start_navigation_login_to_otp_fragment, args);
                        } catch (JSONException e) {
                            throw new RuntimeException(e);
                        }
                    }

                    @Override
                    public void onError(ANError anError) {
                        progressDialog.dismiss();
                        Log.d("LoginFragment RequestOtp", anError.getErrorBody());
                        Log.d("LoginFragment RequestOtp", "" + anError.getErrorCode());

                        Toast.makeText(requireContext(), "Error", Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void register(JSONObject body, View view) {
        AndroidNetworking.post(Constants.BASE_URL + Constants.REGISTER_URL)
                .addJSONObjectBody(body)
                .setPriority(Priority.HIGH)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        Log.d("LoginFragment Register Response", response.toString());
                        login(view);
                    }

                    @Override
                    public void onError(ANError anError) {
                        progressDialog.dismiss();
                        Log.d("LoginFragment Register", body.toString());
                        Log.d("LoginFragment Register", anError.getErrorBody());
                        Log.d("LoginFragment Register", "" + anError.getErrorCode());
                    }
                });
    }

    private void registerWithoutPassword(View view) {
        login(view);
    }
}