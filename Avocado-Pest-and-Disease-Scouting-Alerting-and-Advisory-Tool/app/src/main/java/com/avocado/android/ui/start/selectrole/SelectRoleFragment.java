package com.avocado.android.ui.start.selectrole;

import android.content.Context;
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
import com.avocado.android.data.model.Advisory;
import com.avocado.android.data.model.Role;
import com.avocado.android.databinding.FragmentStartSelectRoleBinding;
import com.avocado.android.ui.views.ProgressDialog;
import com.avocado.android.ui.views.RadioButton;
import com.avocado.android.ui.views.RadioButtonTwelve;
import com.avocado.android.ui.views.RadioGroup;
import com.avocado.android.utils.Constants;
import com.avocado.android.utils.TokenManager;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;

public class SelectRoleFragment extends Fragment {

    private FragmentStartSelectRoleBinding binding;
    private ProgressDialog progressDialog;
    private String role = "";
    private HashMap<String, String> roleMap = new HashMap<>();

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {

        binding = FragmentStartSelectRoleBinding.inflate(inflater, container, false);
        progressDialog = ProgressDialog.create(requireContext(), "Loading...");
        View root = binding.getRoot();

        return root;
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        setUpListeners(view);

        progressDialog.show();
        getRoles();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }

    private void setUpListeners(View view) {
        binding.fragmentStartSelectRoleRadioGroup.setOnCheckedChangeListener(new RadioGroup.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(RadioGroup group, RadioButton checkedButton, int checkedId) {
                if (checkedId == R.id.fragment_start_select_role_farmer_radio_button)
                    role = roleMap.get("Farmer");
                else if (checkedId == R.id.fragment_start_select_role_farm_manager_radio_button)
                    role = "";
                else
                    role = "";
            }
        });

        binding.fragmentStartSelectRoleContinueButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (role.isEmpty()) return;

                Bundle args = new Bundle();
                args.putAll(getArguments());
                args.putString("role", role);
                Navigation.findNavController(view).navigate(R.id.action_start_navigation_select_role_to_login_fragment, args);
            }
        });
    }

    // Convert dp to px
    private int dpToPx(Context context, int dp) {
        return (int) (dp * context.getResources().getDisplayMetrics().density);
    }

    public void getRoles() {
        AndroidNetworking.get(Constants.BASE_URL + Constants.GET_ROLES_URL)
                .setPriority(Priority.HIGH)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        progressDialog.dismiss();
                        Log.d("getRoles", response.toString());

                        try {
                            JSONArray roles = response.getJSONArray("results");
                            if (roles.length() == 0) {
                                Toast.makeText(requireContext(), "No roles found", Toast.LENGTH_SHORT).show();
                            } else {
                                Toast.makeText(requireContext(), "Roles loaded successfully", Toast.LENGTH_SHORT).show();

                                for (int i = 0; i < roles.length(); i++) {
                                    JSONObject role = roles.getJSONObject(i);
                                    Role roleObject = new Role();
                                    roleObject.setId(role.getString("id"));
                                    roleObject.setName(role.getString("role_name"));
                                    roleObject.setDescription(role.getString("description"));

                                    roleMap.put(roleObject.getName(), roleObject.getId());
                                }
                            }
                        } catch (JSONException e) {
                            throw new RuntimeException(e);
                        }
                    }

                    @Override
                    public void onError(ANError anError) {
                        progressDialog.dismiss();
                        Toast.makeText(requireContext(), "Failed to load roles", Toast.LENGTH_SHORT).show();
                        Log.d("getRoles", anError.toString());
                        Log.d("getRoles", anError.getErrorBody());
                        Log.d("getRoles", anError.getErrorCode() + "");
                    }
                });
    }
}