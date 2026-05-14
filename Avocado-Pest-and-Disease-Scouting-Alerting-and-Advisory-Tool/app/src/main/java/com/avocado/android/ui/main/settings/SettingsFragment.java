package com.avocado.android.ui.main.settings;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;

import com.androidnetworking.AndroidNetworking;
import com.androidnetworking.common.Priority;
import com.androidnetworking.error.ANError;
import com.androidnetworking.interfaces.JSONObjectRequestListener;
import com.avocado.android.databinding.FragmentMainSettingsBinding;
import com.avocado.android.ui.main.settings.dialogs.EditProfileBottomSheetDialog;
import com.avocado.android.ui.manageblocks.ManageBlocksActivity;
import com.avocado.android.ui.managefarms.ManageFarmsActivity;
import com.avocado.android.ui.start.StartActivity;
import com.avocado.android.ui.views.ProgressDialog;
import com.avocado.android.utils.Constants;
import com.avocado.android.utils.TokenManager;

import org.json.JSONException;
import org.json.JSONObject;

public class SettingsFragment extends Fragment implements EditProfileBottomSheetDialog.OnSaveListener {

    private FragmentMainSettingsBinding binding;
    private EditProfileBottomSheetDialog editProfileBottomSheetDialog;
    private ProgressDialog progressDialog;

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        SettingsViewModel settingsViewModel =
                new ViewModelProvider(this).get(SettingsViewModel.class);

        binding = FragmentMainSettingsBinding.inflate(inflater, container, false);
        editProfileBottomSheetDialog = new EditProfileBottomSheetDialog();
        progressDialog = ProgressDialog.create(requireContext(), "Loading...");
        View root = binding.getRoot();

        editProfileBottomSheetDialog.setOnSaveListener(this);

        binding.fragmentMainSettingsNameTextView.setText(getName());
        binding.fragmentMainSettingsLocationTextView.setText(getLocation());
        binding.fragmentMainSettingsPhoneNumberTextView.setText(getPhoneNumber());

        return root;
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        checkTokenExpired();

        // observeViewModel();
        setupListeners(view);
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }

    @Override
    public void onSave(String firstName, String lastName, String location, String phoneNumber) {
        progressDialog.show();
        updateUserData(firstName, lastName, location, phoneNumber);
    }

    private void setupListeners(View view) {
        binding.fragmentMainSettingsEditTextView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Bundle args = new Bundle();
                args.putString("firstName", getFirstName());
                args.putString("lastName", getLastName());
                args.putString("location", getLocation());
                args.putString("phoneNumber", getPhoneNumber());

                editProfileBottomSheetDialog.setArguments(args);
                editProfileBottomSheetDialog.show(getChildFragmentManager(), "EditProfileBottomSheetDialog");
            }
        });

        binding.fragmentMainSettingsManageFarmsLinearLayout.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(getActivity(), ManageFarmsActivity.class);
                startActivity(intent);
            }
        });

        binding.fragmentMainSettingsManageBlocksLinearLayout.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(getActivity(), ManageBlocksActivity.class);
                startActivity(intent);
            }
        });

        binding.fragmentMainSettingsLogOutButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                clearTokens();
                clearUserData();

                Intent intent = new Intent(getActivity(), StartActivity.class);
                startActivity(intent);
                requireActivity().finish();
            }
        });
    }

    private String getName() {
        TokenManager tokenManager = new TokenManager(requireContext());
        return tokenManager.getFirstName() + " " + tokenManager.getLastName();
    }

    private String getFirstName() {
        TokenManager tokenManager = new TokenManager(requireContext());
        return tokenManager.getFirstName();
    }

    private String getLastName() {
        TokenManager tokenManager = new TokenManager(requireContext());
        return tokenManager.getLastName();
    }

    private String getLocation() {
        TokenManager tokenManager = new TokenManager(requireContext());
        return tokenManager.getCounty();
    }

    private String getPhoneNumber() {
        TokenManager tokenManager = new TokenManager(requireContext());
        return tokenManager.getPhoneNumber();
    }

    private void clearTokens() {
        TokenManager tokenManager = new TokenManager(requireContext());
        tokenManager.clearTokens();
    }

    private void clearUserData() {
        TokenManager tokenManager = new TokenManager(requireContext());
        tokenManager.clearUserData();
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

    public void updateUserData(String firstName, String lastName, String location, String phoneNumber) {
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
            Log.e("updateUserData", e.toString());
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

                        binding.fragmentMainSettingsNameTextView.setText(firstName + " " + lastName);
                        binding.fragmentMainSettingsLocationTextView.setText(location);
                        binding.fragmentMainSettingsPhoneNumberTextView.setText(phoneNumber);

                        progressDialog.dismiss();
                        Toast.makeText(requireContext(), "Updated successfully", Toast.LENGTH_SHORT).show();
                        Log.d("updateUserData", response.toString());
                    }

                    @Override
                    public void onError(ANError anError) {
                        progressDialog.dismiss();
                        Toast.makeText(requireContext(), "Failed to update", Toast.LENGTH_SHORT).show();
                        Log.d("updateUserData", anError.toString());
                        Log.d("updateUserData", anError.getErrorBody());
                        Log.d("updateUserData", anError.getErrorCode() + "");
                    }
                });
    }
}