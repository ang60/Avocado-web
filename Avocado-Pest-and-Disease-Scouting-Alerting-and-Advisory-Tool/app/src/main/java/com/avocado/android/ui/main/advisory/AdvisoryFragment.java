package com.avocado.android.ui.main.advisory;

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
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.androidnetworking.AndroidNetworking;
import com.androidnetworking.common.Priority;
import com.androidnetworking.error.ANError;
import com.androidnetworking.interfaces.JSONObjectRequestListener;
import com.avocado.android.R;
import com.avocado.android.data.model.Advisory;
import com.avocado.android.data.model.Farm;
import com.avocado.android.databinding.FragmentMainAdvisoryBinding;
import com.avocado.android.ui.start.StartActivity;
import com.avocado.android.ui.views.ProgressDialog;
import com.avocado.android.ui.views.RadioButton;
import com.avocado.android.ui.views.RadioGroup;
import com.avocado.android.utils.Constants;
import com.avocado.android.utils.TokenManager;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;

public class AdvisoryFragment extends Fragment implements AdvisoryAdapter.AdvisoryListener, RecordActionBottomSheetDialog.OnSaveListener {

    private FragmentMainAdvisoryBinding binding;
    private ProgressDialog progressDialog;
    private RecordActionBottomSheetDialog recordActionBottomSheetDialog;
    private AdvisoryAdapter advisoryAdapter;

    ArrayList<Advisory> advisoryArrayList = new ArrayList<>();

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        AdvisoryViewModel advisoryViewModel =
                new ViewModelProvider(this).get(AdvisoryViewModel.class);

        binding = FragmentMainAdvisoryBinding.inflate(inflater, container, false);
        progressDialog = ProgressDialog.create(requireContext(), "Loading...");
        recordActionBottomSheetDialog = new RecordActionBottomSheetDialog();
        View root = binding.getRoot();

        recordActionBottomSheetDialog.setOnSaveListener(this);

        return root;
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        checkTokenExpired();

        setupRecyclerView();
        setupListeners();

        progressDialog.show();
        getAdvisory();

        binding.fragmentMainAdvisoryActionRequiredRadioButton.performClick();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }

    @Override
    public void onAdvisoryClick(Advisory advisory, int position) {

    }

    @Override
    public void onAdvisoryRecordActionClick(Advisory advisory, int position) {
        Bundle args = new Bundle();
        args.putString("advisory_id", advisory.getId());
        args.putString("weekly_record", advisory.getWeeklyRecord());
        args.putString("farmer", advisory.getFarmer());
        args.putString("advisory_message", advisory.getAdvisoryMessage());

        recordActionBottomSheetDialog.setArguments(args);
        recordActionBottomSheetDialog.show(getChildFragmentManager(), "RecordActionBottomSheetDialog");
    }

    @Override
    public void onSave(String advisoryId, String weeklyRecord, String farmer, String advisoryMessage, String actionsTaken, String outcome, String remarks) {
        progressDialog.show();
        updateAdvisory(advisoryId, weeklyRecord, farmer, advisoryMessage, actionsTaken, outcome, remarks);
    }

    private void setupRecyclerView() {
        advisoryAdapter = new AdvisoryAdapter(this);
        RecyclerView rv = binding.fragmentMainAdvisoryRecyclerView;

        rv.setLayoutManager(new LinearLayoutManager(requireContext()));
        rv.setAdapter(advisoryAdapter);
    }

    private void setupListeners() {
        binding.fragmentMainAdvisoryRadioGroup.setOnCheckedChangeListener(new RadioGroup.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(RadioGroup group, RadioButton checkedButton, int checkedId) {
                if (checkedId == R.id.fragment_main_advisory_action_required_radio_button) {
                    advisoryAdapter.getFilter().filter("Action Required");
                } else if (checkedId == R.id.fragment_main_advisory_completed_radio_button) {
                    advisoryAdapter.getFilter().filter("Completed");
                }
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

    public void getAdvisory() {
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
                        progressDialog.dismiss();
                        Log.d("getAdvisories", response.toString());

                        try {
                            JSONArray advisories = response.getJSONArray("results");
                            if (advisories.length() == 0) {
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
                                    advisoryObject.setCategory(advisory.getString("category"));

                                    if (advisoryObject.getActionsTaken().equals("null") && advisoryObject.getOutcome().equals("null")) {
                                        advisoryObject.setCategory("Action Required");
                                    } else {
                                        advisoryObject.setCategory("Completed");
                                    }

                                    advisoryArrayList.add(advisoryObject);
                                }

                                advisoryAdapter.setAdvisoryList(advisoryArrayList);
                                advisoryAdapter.setAdvisoryListFull(advisoryArrayList);
                                advisoryAdapter.getFilter().filter("Action Required");
                            }
                        } catch (JSONException e) {
                            throw new RuntimeException(e);
                        }
                    }

                    @Override
                    public void onError(ANError anError) {
                        progressDialog.dismiss();
                        Toast.makeText(requireContext(), "Failed load advisories", Toast.LENGTH_SHORT).show();
                        Log.d("getAdvisory", anError.toString());
                        Log.d("getAdvisory", anError.getErrorBody());
                        Log.d("getAdvisory", anError.getErrorCode() + "");
                    }
                });
    }

    public void updateAdvisory(String advisoryId, String weeklyRecord, String farmer, String advisoryMessage, String actionsTaken, String outcome, String remarks) {
        TokenManager tokenManager = new TokenManager(requireContext());
        String accessToken = tokenManager.getAccessToken();

        JSONObject body = new JSONObject();
        try {
            body.put("weekly_record", weeklyRecord);
            body.put("farmer", farmer);
            body.put("advisory_message", advisoryMessage);
            body.put("actions_taken", actionsTaken);
            body.put("outcome", outcome);
            body.put("remarks", remarks);
        } catch (JSONException e) {
            Log.e("updateAdvisory", e.toString());
            return;
        }

        AndroidNetworking.put(Constants.BASE_URL + Constants.UPDATE_ADVISORY_URL)
                .addHeaders("Authorization", "Bearer " + accessToken)
                .addHeaders("Content-Type", "application/json")
                .addPathParameter("id", advisoryId)
                .addJSONObjectBody(body)
                .setPriority(Priority.HIGH)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        Toast.makeText(requireContext(), "Advisory updated successfully", Toast.LENGTH_SHORT).show();
                        Log.d("updateAdvisory", response.toString());

                        getAdvisory(); // refresh the list
                    }

                    @Override
                    public void onError(ANError anError) {
                        progressDialog.dismiss();
                        Toast.makeText(requireContext(), "Failed to update", Toast.LENGTH_SHORT).show();
                        Log.d("updateAdvisory", anError.toString());
                        Log.d("updateAdvisory", anError.getErrorBody());
                        Log.d("updateAdvisory", anError.getErrorCode() + "");
                    }
                });
    }
}