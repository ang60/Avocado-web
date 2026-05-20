package com.avocado.android.ui.main.home;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.Navigation;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.androidnetworking.AndroidNetworking;
import com.androidnetworking.common.Priority;
import com.androidnetworking.error.ANError;
import com.androidnetworking.interfaces.JSONObjectRequestListener;
import com.avocado.android.R;
import com.avocado.android.data.model.Advisory;
import com.avocado.android.data.model.Alert;
import com.avocado.android.data.model.Farm;
import com.avocado.android.databinding.FragmentMainHomeBinding;
import com.avocado.android.ui.alerts.AlertsActivity;
import com.avocado.android.ui.record.RecordActivity;
import com.avocado.android.ui.start.StartActivity;
import com.avocado.android.utils.Constants;
import com.avocado.android.utils.TokenManager;
import com.bumptech.glide.Glide;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;

import static android.app.Activity.RESULT_OK;

public class HomeFragment extends Fragment implements AlertsAdapter.AlertsListener {

    private FragmentMainHomeBinding binding;
    private AlertsAdapter alertsAdapter;

    private ActivityResultLauncher<Intent> intentLauncher;

    ArrayList<Advisory> advisoryArrayList = new ArrayList<>();
    ArrayList<Alert> alertArrayList = new ArrayList<>();

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        HomeViewModel homeViewModel =
                new ViewModelProvider(this).get(HomeViewModel.class);

        binding = FragmentMainHomeBinding.inflate(inflater, container, false);
        View root = binding.getRoot();

        binding.fragmentMainHomeAccountNameTextView.setText(getName());
        binding.fragmentMainHomeAccountLocationTextView.setText(getLocation());

        return root;
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        checkTokenExpired();

        setupRecyclerView();
        setupListeners();
        setupIntentLauncher();
        setProfilePicture();

        binding.fragmentMainHomePendingAdvisoryProgressBar.setVisibility(View.VISIBLE);
        binding.fragmentMainHomePendingAdvisoryLinearLayout.setVisibility(View.GONE);
        getAdvisory(1);

        binding.fragmentMainHomeAlertsProgressBar.setVisibility(View.VISIBLE);
        binding.fragmentMainHomeAlertsRecyclerView.setVisibility(View.GONE);
        getAlerts(3);
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }

    @Override
    public void onAlertsClick(Alert alert, int position) {
        Intent intent = new Intent(getActivity(), AlertsActivity.class);
        startActivity(intent);
    }

    private void setProfilePicture() {
        TokenManager tokenManager = new TokenManager(requireContext());
        String profilePicture = tokenManager.getProfilePicture();

        if (profilePicture != null && !profilePicture.isEmpty())
            binding.fragmentMainHomeAccountImageButton.setPadding(0, 0, 0, 0);

        Glide.with(requireContext())
                .load(profilePicture)
                .placeholder(R.drawable.ic_farmer)
                .circleCrop()
                .into(binding.fragmentMainHomeAccountImageButton);
    }

    private String getName() {
        TokenManager tokenManager = new TokenManager(requireContext());
        return tokenManager.getFirstName() + " " + tokenManager.getLastName();
    }

    private String getLocation() {
        TokenManager tokenManager = new TokenManager(requireContext());
        return tokenManager.getCounty();
    }

    private void setupListeners() {
        binding.fragmentMainHomeAccountImageButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Navigation.findNavController(view).navigate(R.id.action_main_navigation_home_to_settings_fragment);
            }
        });

        binding.fragmentMainHomeContinueRecordingButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(getActivity(), RecordActivity.class);
                intentLauncher.launch(intent);
            }
        });

        binding.fragmentMainHomePendingAdvisorySeeAllButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Navigation.findNavController(view).navigate(R.id.action_main_navigation_home_to_advisory_fragment);
            }
        });

        binding.fragmentMainHomePendingAdvisoryLinearLayout.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Navigation.findNavController(view).navigate(R.id.action_main_navigation_home_to_advisory_fragment);
            }
        });

        binding.fragmentMainHomePendingAdvisoryNextImageButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Navigation.findNavController(view).navigate(R.id.action_main_navigation_home_to_advisory_fragment);
            }
        });

        binding.fragmentMainHomeAlertsSeeAllButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(getActivity(), AlertsActivity.class);
                startActivity(intent);
            }
        });

        binding.fragmentMainHomeAlertImageButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(getActivity(), AlertsActivity.class);
                startActivity(intent);
            }
        });
    }

    private void setupRecyclerView() {
        alertsAdapter = new AlertsAdapter(this);
        RecyclerView rv = binding.fragmentMainHomeAlertsRecyclerView;

        rv.setLayoutManager(new LinearLayoutManager(requireContext()));
        rv.setAdapter(alertsAdapter);
    }

    private void setupIntentLauncher() {
        intentLauncher = registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
                    if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                        binding.fragmentMainHomePendingAdvisoryProgressBar.setVisibility(View.VISIBLE);
                        binding.fragmentMainHomePendingAdvisoryLinearLayout.setVisibility(View.GONE);
                        getAdvisory(1);

                        binding.fragmentMainHomeAlertsProgressBar.setVisibility(View.VISIBLE);
                        binding.fragmentMainHomeAlertsRecyclerView.setVisibility(View.GONE);
                        getAlerts(3);
                    }
                }
        );
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

    public void getAdvisory(int count) {
        TokenManager tokenManager = new TokenManager(requireContext());
        String accessToken = tokenManager.getAccessToken();

        AndroidNetworking.get(Constants.BASE_URL + Constants.GET_ADVISORY_URL)
                .addHeaders("Authorization", "Bearer " + accessToken)
                .addHeaders("Content-Type", "application/json")
                .setPriority(Priority.HIGH)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        binding.fragmentMainHomePendingAdvisoryProgressBar.setVisibility(View.GONE);
                        binding.fragmentMainHomePendingAdvisoryLinearLayout.setVisibility(View.VISIBLE);
                        Log.d("getAdvisories", response.toString());

                        try {
                            JSONArray advisories = response.getJSONArray("results");
                            if (advisories.length() == 0) {
                                binding.fragmentMainHomePendingAdvisoryLinearLayout.setVisibility(View.GONE);
                                Toast.makeText(requireContext(), "No advisories found", Toast.LENGTH_SHORT).show();
                            } else {
                                Toast.makeText(requireContext(), "Advisories loaded successfully", Toast.LENGTH_SHORT).show();

                                advisoryArrayList.clear();
                                for (int i = 0; i < advisories.length(); i++) {
                                    JSONObject advisory = advisories.getJSONObject(i);
                                    Advisory advisoryObject = new Advisory();
                                    advisoryObject.setId(advisory.getString("id"));
                                    advisoryObject.setWeeklyRecord(advisory.getString("weekly_record"));
                                    advisoryObject.setFarmer(advisory.getString("farmer"));
                                    advisoryObject.setAdvisoryMessage(advisory.getString("advisory_message"));
                                    advisoryObject.setActionsTaken(advisory.getString("actions_taken"));
                                    advisoryObject.setOutcome(advisory.getString("outcome"));
                                    advisoryObject.setRemarks(advisory.getString("remarks"));
                                    advisoryObject.setTimestamp(advisory.getString("timestamp"));
                                    advisoryObject.setActionTakenStatus(advisory.getString("action_taken_status"));
                                    advisoryObject.setTimeAgo(advisory.getString("time_ago"));

                                    if (advisoryObject.getActionsTaken().equals("null") && advisoryObject.getOutcome().equals("null")) {
                                        advisoryObject.setCategory("Action Required");
                                    } else {
                                        advisoryObject.setCategory("Completed");
                                    }

                                    if (i == count) break;
                                    advisoryArrayList.add(advisoryObject);
                                }

                                Advisory advisory = advisoryArrayList.get(0);
                                String advisoryMessage = advisory.getAdvisoryMessage();

                                String [] advisoryMessageParts = advisoryMessage.split(":\\n");
                                String [] titleParts = advisoryMessageParts[0].split(" - ");
                                String title = titleParts[0];
                                String subTitle = titleParts[1];

                                binding.fragmentMainHomePendingAdvisoryTitleTextView.setText(title);
                                binding.fragmentMainHomePendingAdvisorySubTitleTextView.setText(subTitle);
                            }
                        } catch (JSONException e) {
                            throw new RuntimeException(e);
                        }
                    }

                    @Override
                    public void onError(ANError anError) {
                        binding.fragmentMainHomePendingAdvisoryProgressBar.setVisibility(View.GONE);
                        binding.fragmentMainHomePendingAdvisoryLinearLayout.setVisibility(View.GONE);
                        Toast.makeText(requireContext(), "Failed load advisories", Toast.LENGTH_SHORT).show();
                        Log.d("getAdvisory", anError.toString());
                        Log.d("getAdvisory", anError.getErrorBody());
                        Log.d("getAdvisory", anError.getErrorCode() + "");
                    }
                });
    }

    public void getAlerts(int count) {
        TokenManager tokenManager = new TokenManager(requireContext());
        String accessToken = tokenManager.getAccessToken();

        AndroidNetworking.get(Constants.BASE_URL + Constants.GET_ALERTS_URL)
                .addHeaders("Authorization", "Bearer " + accessToken)
                .addHeaders("Content-Type", "application/json")
                .setPriority(Priority.HIGH)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        binding.fragmentMainHomeAlertsProgressBar.setVisibility(View.GONE);
                        binding.fragmentMainHomeAlertsRecyclerView.setVisibility(View.VISIBLE);
                        Log.d("getAlerts", response.toString());

                        try {
                            JSONArray alerts = response.getJSONArray("results");
                            if (alerts.length() == 0) {
                                Toast.makeText(requireContext(), "No alerts found", Toast.LENGTH_SHORT).show();
                            } else {
                                Toast.makeText(requireContext(), "Alerts loaded successfully", Toast.LENGTH_SHORT).show();

                                alertArrayList.clear();
                                for (int i = 0; i < alerts.length(); i++) {
                                    JSONObject alert = alerts.getJSONObject(i);
                                    Alert alertObject = new Alert();
                                    alertObject.setId(alert.getString("id"));
                                    alertObject.setFarmer(alert.getString("farmer"));
                                    alertObject.setTitle(alert.getString("title"));
                                    alertObject.setMessage(alert.getString("message"));
                                    alertObject.setRead(alert.getBoolean("is_read"));
                                    alertObject.setTimestamp(alert.getString("timestamp"));
                                    alertObject.setTimeAgo(alert.getString("time_ago"));

                                    if (i == count) break;
                                    alertArrayList.add(alertObject);
                                }
                                alertsAdapter.setAlertsList(alertArrayList);
                                alertsAdapter.setAlertsListFull(alertArrayList);
                                binding.fragmentMainHomeAlertCountTextView.setText(alerts.length() + "");
                            }

                        } catch (JSONException e) {
                            throw new RuntimeException(e);
                        }
                    }

                    @Override
                    public void onError(ANError anError) {
                        binding.fragmentMainHomeAlertsProgressBar.setVisibility(View.GONE);
                        binding.fragmentMainHomeAlertsRecyclerView.setVisibility(View.GONE);
                        Toast.makeText(requireContext(), "Failed load alerts", Toast.LENGTH_SHORT).show();
                        Log.d("getAlerts", anError.toString());
                        Log.d("getAlerts", anError.getErrorBody());
                        Log.d("getAlerts", anError.getErrorCode() + "");
                    }
                });
    }
}