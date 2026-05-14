package com.avocado.android.ui.main.records;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Toast;

import com.androidnetworking.AndroidNetworking;
import com.androidnetworking.common.Priority;
import com.androidnetworking.error.ANError;
import com.androidnetworking.interfaces.JSONObjectRequestListener;
import com.avocado.android.data.model.Alert;
import com.avocado.android.data.model.Record;
import com.avocado.android.databinding.FragmentMainRecordsBinding;
import com.avocado.android.ui.main.home.AlertsAdapter;
import com.avocado.android.ui.start.StartActivity;
import com.avocado.android.ui.views.ProgressDialog;
import com.avocado.android.utils.Constants;
import com.avocado.android.utils.TokenManager;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

public class RecordsFragment extends Fragment implements RecordsAdapter.RecordListener {

    private RecordsViewModel recordsViewModel;
    private FragmentMainRecordsBinding binding;
    private RecordsAdapter recordsAdapter;
    private ProgressDialog progressDialog;

    ArrayList<Record> recordList = new ArrayList<>();

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        recordsViewModel = new ViewModelProvider(this).get(RecordsViewModel.class);
        binding = FragmentMainRecordsBinding.inflate(inflater, container, false);
        progressDialog = ProgressDialog.create(requireContext(), "Loading...");

        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        observeViewModel();
        setupRecyclerView();
        checkTokenExpired();

        progressDialog.show();
        getRecords();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }

    @Override
    public void onRecordClick(Record record, int position) {

    }

    private void observeViewModel() {
        recordsViewModel.getTotalRecords().observe(getViewLifecycleOwner(), totalRecords -> {
            binding.fragmentMainRecordsTotalTextView.setText(totalRecords);
        });

        recordsViewModel.getDoneRecords().observe(getViewLifecycleOwner(), doneRecords -> {
            binding.fragmentMainRecordsDoneTextView.setText(doneRecords);
        });

        recordsViewModel.getPendingRecords().observe(getViewLifecycleOwner(), pendingRecords -> {
            binding.fragmentMainRecordsPendingTextView.setText(pendingRecords);
        });
    }

    private void setupRecyclerView() {
        recordsAdapter = new RecordsAdapter(this);
        RecyclerView rv = binding.fragmentMainRecordsRecyclerView;

        rv.setLayoutManager(new LinearLayoutManager(requireContext()));
        rv.setAdapter(recordsAdapter);
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

    public void getRecords() {
        TokenManager tokenManager = new TokenManager(requireContext());
        String accessToken = tokenManager.getAccessToken();

        AndroidNetworking.get(Constants.BASE_URL + Constants.WEEKLY_RECORDS_URL)
                .addHeaders("Authorization", "Bearer " + accessToken)
                .addHeaders("Content-Type", "application/json")
                .setPriority(Priority.HIGH)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        progressDialog.dismiss();
                        Log.d("getRecords", response.toString());

                        try {
                            JSONArray records = response.getJSONArray("results");
                            recordsViewModel.setTotalRecords(records.length() + "");
                            recordsViewModel.setDoneRecords(records.length() + "");
                            recordsViewModel.setPendingRecords("0");

                            if (records.length() == 0) {
                                Toast.makeText(requireContext(), "No records found", Toast.LENGTH_SHORT).show();
                            } else {
                                Toast.makeText(requireContext(), "Records loaded successfully", Toast.LENGTH_SHORT).show();

                                recordList.clear();
                                for (int i = 0; i < records.length(); i++) {
                                    JSONObject record = records.getJSONObject(i);
                                    String farmName = record.getJSONObject("block").getJSONObject("farm_name").getString("farm_name");
                                    String location = record.getJSONObject("block").getJSONObject("farm_name").getString("location");
                                    String blockName = record.getJSONObject("block").getString("block_name");
                                    String timestamp = record.getString("timestamp");
                                    String[] date = timestamp.split("T");
                                    String[] time = date[1].split(":");

                                    Record recordObject = new Record();
                                    recordObject.setFarmName(farmName);
                                    recordObject.setLocation(location);
                                    recordObject.setBlockName(blockName);
                                    recordObject.setTimestamp(date[0] + " " + time[0] + ":" + time[1]);
                                    recordList.add(recordObject);
                                }
                                recordsAdapter.setRecordList(recordList);
                                recordsAdapter.setRecordListFull(recordList);
                            }

                        } catch (JSONException e) {
                            throw new RuntimeException(e);
                        }
                    }

                    @Override
                    public void onError(ANError anError) {
                        progressDialog.dismiss();
                        Toast.makeText(requireContext(), "Failed load records", Toast.LENGTH_SHORT).show();
                        Log.d("getRecords", anError.toString());
                        Log.d("getRecords", anError.getErrorBody());
                        Log.d("getRecords", anError.getErrorCode() + "");
                    }
                });
    }
}