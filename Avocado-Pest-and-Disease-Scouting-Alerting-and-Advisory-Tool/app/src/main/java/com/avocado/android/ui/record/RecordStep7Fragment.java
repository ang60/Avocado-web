package com.avocado.android.ui.record;

import android.content.Intent;
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
import com.avocado.android.data.model.Data;
import com.avocado.android.data.model.PestsObserved;
import com.avocado.android.data.model.TrapUse;
import com.avocado.android.databinding.FragmentRecordStep7Binding;
import com.avocado.android.ui.start.StartActivity;
import com.avocado.android.ui.views.ProgressDialog;
import com.avocado.android.utils.Constants;
import com.avocado.android.utils.DateTimeManager;
import com.avocado.android.utils.TokenManager;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.Navigation;

import static android.app.Activity.RESULT_OK;

public class RecordStep7Fragment extends Fragment {

    private RecordsViewModel recordsViewModel;
    private FragmentRecordStep7Binding binding;
    ProgressDialog progressDialog;

    public static RecordStep7Fragment newInstance() {
        return new RecordStep7Fragment();
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        // Activity-scoped Android ViewModel so all fragments inside the same activity share one ViewModel instance
        // requireActivity() returns the activity that created the fragment
        recordsViewModel = new ViewModelProvider(requireActivity()).get(RecordsViewModel.class);

        binding = FragmentRecordStep7Binding.inflate(inflater, container, false);
        progressDialog = ProgressDialog.create(requireContext(), "Loading...");
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        checkTokenExpired();

        observeViewModel();
        setupListeners(view);

        TokenManager tokenManager = new TokenManager(requireContext());
        recordsViewModel.data.location = tokenManager.getCounty();

        binding.fragmentRecordStep7FarmInformationBlockTextView.setText(recordsViewModel.data.blockName);
        binding.fragmentRecordStep7FarmInformationVarietyTextView.setText(recordsViewModel.data.variety);
        binding.fragmentRecordStep7FarmInformationGpsCoordinatesTextView.setText("Ready");

        List<String> trapUseList = new ArrayList<>();
        for (TrapUse trapUse : recordsViewModel.data.trapUse) {
            trapUseList.add(trapUse.getTypeOfTrap() + " - " + trapUse.getNumberOfTraps() + " traps - " + trapUse.getAverageNumberOfPestsPerTrap() + " pests/trap");
        }
        binding.fragmentRecordStep7TrapsTrapsStatusTextView.setText(trapUseList.toString());

        List<String> pestObservedList = new ArrayList<>();
        List<String> pestCountList = new ArrayList<>();
        for (PestsObserved pestsObserved : recordsViewModel.data.pestsObserved) {
            pestObservedList.add(pestsObserved.getName());
            pestCountList.add(pestsObserved.getName() + ": " + pestsObserved.getNumberPerTrap());
        }
        binding.fragmentRecordStep7PestsPestsObservedTextView.setText(pestObservedList.toString());
        binding.fragmentRecordStep7PestsPestsCountTextView.setText(pestCountList.toString());
        binding.fragmentRecordStep7PestsTreesAffectedTextView.setText(String.valueOf(0));

        binding.fragmentRecordStep7BeneficialInsectsObservedTextView.setText(recordsViewModel.data.beneficialInsectsObserved.toString());

        binding.fragmentRecordStep7DiseasesDiseasesObservedTextView.setText(recordsViewModel.data.diseases.toString());

        binding.fragmentRecordStep7ControlActionsActionsTakenTextView.setText(recordsViewModel.data.actionsTaken.toString());
        binding.fragmentRecordStep7ControlActionsOutcomeTextView.setText(recordsViewModel.data.outcome);

        binding.fragmentRecordStep7SurveyInformationStartDateTextView.setText(recordsViewModel.data.startDate);
        binding.fragmentRecordStep7SurveyInformationEndDateTextView.setText(recordsViewModel.data.endDate);
        binding.fragmentRecordStep7SurveyInformationDurationTextView.setText(DateTimeManager.duration(DateTimeManager.convertDateToEpoch2(recordsViewModel.data.startDate), DateTimeManager.convertDateToEpoch2(recordsViewModel.data.endDate)));
    }

    private void observeViewModel() {

    }

    private void setupListeners(View view) {
        binding.fragmentRecordStep7FarmInformationEditButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Navigation.findNavController(view)
                        .popBackStack(R.id.navigation_record_step_1, false);
            }
        });

        binding.fragmentRecordStep7TrapsEditButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Navigation.findNavController(view)
                        .popBackStack(R.id.navigation_record_step_2, false);
            }
        });

        binding.fragmentRecordStep7PestsEditButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Navigation.findNavController(view)
                        .popBackStack(R.id.navigation_record_step_3, false);
            }
        });

        binding.fragmentRecordStep7BeneficialInsectsEditButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Navigation.findNavController(view)
                        .popBackStack(R.id.navigation_record_step_4, false);
            }
        });

        binding.fragmentRecordStep7DiseasesEditButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Navigation.findNavController(view)
                        .popBackStack(R.id.navigation_record_step_5, false);
            }
        });

        binding.fragmentRecordStep7ControlActionsEditButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Navigation.findNavController(view)
                        .popBackStack(R.id.navigation_record_step_6, false);
            }
        });

        binding.fragmentRecordStep7BackButton.setOnClickListener(v ->
                Navigation.findNavController(v).popBackStack()
        );

        binding.fragmentRecordStep7ContinueButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                progressDialog.show();

                TokenManager tokenManager = new TokenManager(requireContext());
                String userId = tokenManager.getUserId();
                
                JSONObject body = new JSONObject();
                try {
                    JSONArray trapUseArray = new JSONArray();
                    for (TrapUse trapUse : recordsViewModel.data.trapUse) {

                        JSONObject trapUseObj = new JSONObject();
                        trapUseObj.put("type_of_trap", trapUse.getTypeOfTrap());
                        trapUseObj.put("number_of_trap", trapUse.getNumberOfTraps());
                        trapUseObj.put("average_no_of_pest_per_trap", trapUse.getAverageNumberOfPestsPerTrap());
                        trapUseObj.put("trap_photo", trapUse.getTrapPhoto());

                        trapUseArray.put(trapUseObj);
                    }

                    JSONArray pestObservedArray = new JSONArray();
                    for (PestsObserved pestsObserved : recordsViewModel.data.pestsObserved) {

                        JSONObject pestObservedObj = new JSONObject();
                        pestObservedObj.put("name", pestsObserved.getName());
                        pestObservedObj.put("number_per_trap", pestsObserved.getNumberPerTrap());
                        pestObservedObj.put("photo_trap", pestsObserved.getPhotoTrap());

                        pestObservedArray.put(pestObservedObj);
                    }

                    body.put("farmer", userId);
                    body.put("block", recordsViewModel.data.blockId);
                    body.put("dont_know_variety", recordsViewModel.data.dontKnowVariety);
                    body.put("dont_know_variety_photo", recordsViewModel.data.dontKnowVarietyPhoto);
                    body.put("dont_know_variety_note", recordsViewModel.data.dontKnowVarietyNote);
                    body.put("variety", recordsViewModel.data.variety);
                    body.put("trap_use", trapUseArray);
                    body.put("dont_know_trap_photo", recordsViewModel.data.dontKnowTrapPhoto);
                    body.put("other_trap_photo", recordsViewModel.data.otherTrapPhoto);
                    body.put("any_pests_observed", recordsViewModel.data.anyPestsObserved);
                    body.put("pests_observed", pestObservedArray);
                    body.put("dont_know_pest", recordsViewModel.data.dontKnowPest);
                    body.put("dont_know_pest_photo", recordsViewModel.data.dontKnowPestPhoto);
                    body.put("dont_know_pest_note", recordsViewModel.data.dontKnowPestNote);
                    body.put("beneficial_insects_observed", new JSONArray(recordsViewModel.data.beneficialInsectsObserved));
                    body.put("dont_know_beneficial_insects_observed", recordsViewModel.data.dontKnowBeneficialInsectsObserved);
                    body.put("dont_know_beneficial_insects_observed_photo", recordsViewModel.data.dontKnowBeneficialInsectsObservedPhoto);
                    body.put("dont_know_beneficial_insects_observed_note", recordsViewModel.data.dontKnowBeneficialInsectsObservedNote);
                    body.put("other_production_challenges", new JSONArray(recordsViewModel.data.otherProductionChallenges));
                    body.put("any_diseases_observed", recordsViewModel.data.anyDiseasesObserved);
                    body.put("disease", new JSONArray(recordsViewModel.data.diseases));
                    body.put("disease_plant_part", new JSONArray(recordsViewModel.data.diseasePlantPart));
                    body.put("disease_crop_stage", recordsViewModel.data.diseaseCropStage);
                    body.put("disease_detection_method", recordsViewModel.data.diseaseDetectionMethod);
                    body.put("dont_know_disease", recordsViewModel.data.dontKnowDisease);
                    body.put("dont_know_disease_note", recordsViewModel.data.dontKnowDiseaseNote);
                    body.put("actions_taken", new JSONArray(recordsViewModel.data.actionsTaken));
                    body.put("outcome", recordsViewModel.data.outcome);
                    body.put("remarks", recordsViewModel.data.remarks);
                    body.put("start_date", recordsViewModel.data.startDate);
                    body.put("end_date", recordsViewModel.data.endDate);
                    body.put("location", recordsViewModel.data.location);
                    body.put("gps_latitude", recordsViewModel.data.gpsLatitude);
                    body.put("gps_longitude", recordsViewModel.data.gpsLongitude);
                } catch (Exception e) {
                    Log.d("RecordStep7Fragment WeeklyRecord", e.toString());
                }

                try {
                    postWeeklyRecord(body);
                    //postWeeklyRecord1(body);
                } catch (JSONException e) {
                    progressDialog.dismiss();
                    Log.d("RecordStep7Fragment WeeklyRecord", e.toString());
                }
            }
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null; // prevent memory leaks
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

    private void complete() {
        Intent resultIntent = new Intent();
        resultIntent.putExtra("Reload", true);

        requireActivity().setResult(RESULT_OK, resultIntent);
        requireActivity().finish();
    }

    private void postWeeklyRecord(JSONObject body) throws JSONException {
        TokenManager tokenManager = new TokenManager(requireContext());
        String accessToken = tokenManager.getAccessToken();

        AndroidNetworking.upload(Constants.BASE_URL + Constants.WEEKLY_RECORDS_URL)
                .addHeaders("Authorization", "Bearer " + accessToken)
                .addMultipartParameter("farmer", tokenManager.getUserId())
                .addMultipartParameter("block", recordsViewModel.data.blockId)
                .addMultipartParameter("dont_know_variety", String.valueOf(recordsViewModel.data.dontKnowVariety))
                .addMultipartFile("dont_know_variety_photo", recordsViewModel.data.dontKnowVarietyPhoto)
                .addMultipartParameter("dont_know_variety_note", recordsViewModel.data.dontKnowVarietyNote)
                .addMultipartParameter("variety", recordsViewModel.data.variety)
                .addMultipartParameter("trap_use", new JSONArray(recordsViewModel.data.trapUse).toString())
                .addMultipartFile("dont_know_trap_photo", recordsViewModel.data.dontKnowTrapPhoto)
                .addMultipartFile("other_trap_photo", recordsViewModel.data.otherTrapPhoto)
                .addMultipartParameter("any_pests_observed", recordsViewModel.data.anyPestsObserved)
                .addMultipartParameter("pests_observed", new JSONArray(recordsViewModel.data.pestsObserved).toString())
                .addMultipartParameter("dont_know_pest", String.valueOf(recordsViewModel.data.dontKnowPest))
                .addMultipartFile("dont_know_pest_photo", recordsViewModel.data.dontKnowPestPhoto)
                .addMultipartParameter("dont_know_pest_note", recordsViewModel.data.dontKnowPestNote)
                .addMultipartParameter("beneficial_insects_observed", new JSONArray(recordsViewModel.data.beneficialInsectsObserved).toString())
                .addMultipartParameter("dont_know_beneficial_insects_observed", String.valueOf(recordsViewModel.data.dontKnowBeneficialInsectsObserved))
                .addMultipartFile("dont_know_beneficial_insects_observed_photo", recordsViewModel.data.dontKnowBeneficialInsectsObservedPhoto)
                .addMultipartParameter("dont_know_beneficial_insects_observed_note", recordsViewModel.data.dontKnowBeneficialInsectsObservedNote)
                .addMultipartParameter("other_production_challenges", new JSONArray(recordsViewModel.data.otherProductionChallenges).toString())
                .addMultipartParameter("any_diseases_observed", recordsViewModel.data.anyDiseasesObserved)
                .addMultipartParameter("disease", new JSONArray(recordsViewModel.data.diseases).toString())
                .addMultipartParameter("disease_plant_part", new JSONArray(recordsViewModel.data.diseasePlantPart).toString())
                .addMultipartParameter("disease_crop_stage", recordsViewModel.data.diseaseCropStage)
                .addMultipartParameter("disease_detection_method", recordsViewModel.data.diseaseDetectionMethod)
                .addMultipartParameter("dont_know_disease", String.valueOf(recordsViewModel.data.dontKnowDisease))
                .addMultipartParameter("dont_know_disease_note", recordsViewModel.data.dontKnowDiseaseNote)
                .addMultipartParameter("actions_taken", new JSONArray(recordsViewModel.data.actionsTaken).toString())
                .addMultipartParameter("outcome", recordsViewModel.data.outcome)
                .addMultipartParameter("remarks", recordsViewModel.data.remarks)
                .addMultipartParameter("start_date", recordsViewModel.data.startDate)
                .addMultipartParameter("end_date", recordsViewModel.data.endDate)
                .addMultipartParameter("location", recordsViewModel.data.location)
                .addMultipartParameter("gps_latitude", recordsViewModel.data.gpsLatitude)
                .addMultipartParameter("gps_longitude", recordsViewModel.data.gpsLongitude)
                .setPriority(Priority.HIGH)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        progressDialog.dismiss();
                        Toast.makeText(requireContext(), "Record submitted successfully", Toast.LENGTH_SHORT).show();
                        Log.d("RecordStep7Fragment WeeklyRecord Response", body.toString());
                        Log.d("RecordStep7Fragment WeeklyRecord Response", response.toString());

                        complete();
                    }

                    @Override
                    public void onError(ANError anError) {
                        progressDialog.dismiss();
                        Log.d("RecordStep7Fragment WeeklyRecord Response", body.toString());
                        Log.d("RecordStep7Fragment WeeklyRecord Response", anError.getErrorBody());
                        Log.d("RecordStep7Fragment WeeklyRecord Response", "" + anError.getErrorCode());
                    }
                });
    }

    private void postWeeklyRecord1(JSONObject body) throws JSONException {
        TokenManager tokenManager = new TokenManager(requireContext());
        String accessToken = tokenManager.getAccessToken();

        AndroidNetworking.post(Constants.BASE_URL + Constants.WEEKLY_RECORDS_URL)
                .addHeaders("Authorization", "Bearer " + accessToken)
                .addHeaders("Content-Type", "application/json")
                .addJSONObjectBody(body)
                .setPriority(Priority.HIGH)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        progressDialog.dismiss();
                        Toast.makeText(requireContext(), "Record submitted successfully", Toast.LENGTH_SHORT).show();
                        Log.d("RecordStep7Fragment WeeklyRecord Response", body.toString());
                        Log.d("RecordStep7Fragment WeeklyRecord Response", response.toString());

                        complete();
                    }

                    @Override
                    public void onError(ANError anError) {
                        progressDialog.dismiss();
                        Log.d("RecordStep7Fragment WeeklyRecord Response", body.toString());
                        Log.d("RecordStep7Fragment WeeklyRecord Response", anError.getErrorBody());
                        Log.d("RecordStep7Fragment WeeklyRecord Response", "" + anError.getErrorCode());
                    }
                });
    }
}
