package com.avocado.android.ui.alerts;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
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
import com.avocado.android.ui.record.RecordActivity;
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

        binding.activityAlertsCategoriesAllRadioButton.performClick();
    }

    @Override
    public void onAlertsClick(Alert alert, int position) {

    }

    @Override
    public void onAlertsClearClick(Alert alert, int position) {
        showAlertDialog(alert);
    }

    private void showAlertDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(AlertsActivity.this);
        builder.setTitle("Mark all as read");
        builder.setMessage("Are you sure you want to mark all messages as read?");
        builder.setPositiveButton("Yes", (dialog, which) -> {
            progressDialog.show();
            markAllAlertsAsRead();
        });
        builder.setNegativeButton("No", (dialog, which) -> {
            dialog.dismiss();
        });

        AlertDialog dialog = builder.create();
        dialog.show();
    }

    private void showAlertDialog(Alert alert) {
        AlertDialog.Builder builder = new AlertDialog.Builder(AlertsActivity.this);
        builder.setTitle("Mark as read");
        builder.setMessage("Are you sure you want to mark this message as read?");
        builder.setPositiveButton("Yes", (dialog, which) -> {
            progressDialog.show();
            markAlertAsRead(alert.getId());
        });
        builder.setNegativeButton("No", (dialog, which) -> {
            dialog.dismiss();
        });

        AlertDialog dialog = builder.create();
        dialog.show();
    }

    private void setupRecyclerView() {
        alertsAdapter = new AlertsAdapter(this);
        RecyclerView rv = binding.activityAlertsRecyclerView;

        rv.setLayoutManager(new LinearLayoutManager(getApplicationContext()));
        rv.setAdapter(alertsAdapter);
    }

    private void setupListeners() {
        binding.activityAlertsMarkAllReadButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                showAlertDialog();
            }
        });

        binding.activityAlertsCategoriesRadioGroup.setOnCheckedChangeListener(new RadioGroup.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(RadioGroup group, RadioButton checkedButton, int checkedId) {
                if (checkedId == R.id.activity_alerts_categories_all_radio_button) {
                    alertsAdapter.getFilter().filter("");
                }
                else if (checkedId == R.id.activity_alerts_categories_unread_radio_button) {
                    alertsAdapter.getFilter().filter("Unread");
                }
                else {
                    String category = checkedButton.getText().toString();
                    alertsAdapter.getFilter().filter(category);
                }
            }
        });
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
                                    alertObject.setCategory(alert.getString("category"));

                                    alertArrayList.add(alertObject);
                                }

                                alertsAdapter.setAlertsList(alertArrayList);
                                alertsAdapter.setAlertsListFull(alertArrayList);
                                alertsAdapter.getFilter().filter("");
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

    public void markAlertAsRead(String id) {
        TokenManager tokenManager = new TokenManager(getApplicationContext());
        String accessToken = tokenManager.getAccessToken();

        AndroidNetworking.post(Constants.BASE_URL + Constants.UPDATE_ALERTS_MARK_AS_READ_URL)
                .addHeaders("Authorization", "Bearer " + accessToken)
                .addHeaders("Content-Type", "application/json")
                .addPathParameter("id", id)
                .setPriority(Priority.HIGH)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        Toast.makeText(AlertsActivity.this, "Alert marked as read", Toast.LENGTH_SHORT).show();
                        Log.d("markAlertAsRead", response.toString());

                        getAlerts(); // refresh the list
                    }

                    @Override
                    public void onError(ANError anError) {
                        progressDialog.dismiss();
                        Toast.makeText(getApplicationContext(), "Failed to mark alert as read", Toast.LENGTH_SHORT).show();
                        Log.d("markAlertAsRead", anError.toString());
                        Log.d("markAlertAsRead", anError.getErrorBody());
                        Log.d("markAlertAsRead", anError.getErrorCode() + "");
                    }
                });
    }

    public void markAllAlertsAsRead() {
        TokenManager tokenManager = new TokenManager(getApplicationContext());
        String accessToken = tokenManager.getAccessToken();

        AndroidNetworking.post(Constants.BASE_URL + Constants.UPDATE_ALERTS_MARK_ALL_AS_READ_URL)
                .addHeaders("Authorization", "Bearer " + accessToken)
                .addHeaders("Content-Type", "application/json")
                .setPriority(Priority.HIGH)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        Toast.makeText(AlertsActivity.this, "Alerts marked as read", Toast.LENGTH_SHORT).show();
                        Log.d("markAllAlertsAsRead", response.toString());

                        getAlerts(); // refresh the list
                    }

                    @Override
                    public void onError(ANError anError) {
                        progressDialog.dismiss();
                        Toast.makeText(getApplicationContext(), "Failed to mark alerts as read", Toast.LENGTH_SHORT).show();
                        Log.d("markAllAlertsAsRead", anError.toString());
                        Log.d("markAllAlertsAsRead", anError.getErrorBody());
                        Log.d("markAllAlertsAsRead", anError.getErrorCode() + "");
                    }
                });
    }
}