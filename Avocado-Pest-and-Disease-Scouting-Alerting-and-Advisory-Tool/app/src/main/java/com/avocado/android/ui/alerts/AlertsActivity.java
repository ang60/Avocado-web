package com.avocado.android.ui.alerts;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.androidnetworking.AndroidNetworking;
import com.androidnetworking.common.Priority;
import com.androidnetworking.error.ANError;
import com.androidnetworking.interfaces.JSONObjectRequestListener;
import com.avocado.android.R;
import com.avocado.android.data.model.Advisory;
import com.avocado.android.data.model.Alert;
import com.avocado.android.databinding.ActivityAlertsBinding;
import com.avocado.android.ui.main.advisory.AdvisoryAdapter;
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

import static androidx.core.content.ContentProviderCompat.requireContext;

public class AlertsActivity extends AppCompatActivity implements AlertsAdapter.AlertsListener {

    private ActivityAlertsBinding binding;
    AlertsAdapter alertsAdapter;
    ProgressDialog progressDialog;

    ArrayList<Alert> alertArrayList = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        binding = ActivityAlertsBinding.inflate(getLayoutInflater());
        progressDialog = ProgressDialog.create(this, "Loading...");
        setContentView(binding.getRoot());

        checkTokenExpired();

        setupRecyclerView();
        setupListeners();

        progressDialog.show();
        getAlerts();
    }

    @Override
    public void onAlertsClick(Alert alert, int position) {

    }

    @Override
    public void onAlertsClearClick(Alert alert, int position) {

    }

    private void setupRecyclerView() {
        alertsAdapter = new AlertsAdapter(this);
        RecyclerView rv = binding.activityAlertsRecyclerView;

        rv.setLayoutManager(new LinearLayoutManager(getApplicationContext()));
        rv.setAdapter(alertsAdapter);
    }

    private void setupListeners() {

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

    public void getAlerts() {
        TokenManager tokenManager = new TokenManager(getApplicationContext());
        String accessToken = tokenManager.getAccessToken();

        AndroidNetworking.get(Constants.BASE_URL + Constants.GET_ALERTS_URL)
                .addHeaders("Authorization", "Bearer " + accessToken)
                .addHeaders("Content-Type", "application/json")
                .setPriority(Priority.HIGH)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        progressDialog.dismiss();
                        Log.d("getAlerts", response.toString());

                        try {
                            JSONArray alerts = response.getJSONArray("results");
                            if (alerts.length() == 0) {
                                Toast.makeText(getApplicationContext(), "No alerts found", Toast.LENGTH_SHORT).show();
                            } else {
                                Toast.makeText(getApplicationContext(), "Alerts loaded successfully", Toast.LENGTH_SHORT).show();

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

                                    alertArrayList.add(alertObject);
                                }
                                alertsAdapter.setAlertsList(alertArrayList);
                                alertsAdapter.setAlertsListFull(alertArrayList);
                            }
                        } catch (JSONException e) {
                            throw new RuntimeException(e);
                        }
                    }

                    @Override
                    public void onError(ANError anError) {
                        progressDialog.dismiss();
                        Toast.makeText(getApplicationContext(), "Failed load alerts", Toast.LENGTH_SHORT).show();
                        Log.d("getAlerts", anError.toString());
                        Log.d("getAlerts", anError.getErrorBody());
                        Log.d("getAlerts", anError.getErrorCode() + "");
                    }
                });
    }
}