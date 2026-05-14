package com.avocado.android.ui.record;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import com.avocado.android.R;
import com.avocado.android.data.model.Data;
import com.avocado.android.data.model.PestsObserved;
import com.avocado.android.databinding.FragmentRecordStep6Binding;
import com.avocado.android.ui.views.AutoFitGridLayout;
import com.avocado.android.ui.views.CheckBox;
import com.avocado.android.ui.views.CheckBoxOne;
import com.avocado.android.ui.views.CheckBoxThree;
import com.avocado.android.ui.views.FlowLinearLayout;
import com.avocado.android.ui.views.RadioButton;
import com.avocado.android.ui.views.RadioButtonFour;
import com.avocado.android.ui.views.RadioGroup;
import com.avocado.android.ui.views.RecursiveRadioGroup;
import com.avocado.android.utils.DateTimeManager;

import java.util.ArrayList;
import java.util.List;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.Navigation;

public class RecordStep6Fragment extends Fragment {

    private RecordsViewModel recordsViewModel;
    private FragmentRecordStep6Binding binding;

    public static RecordStep6Fragment newInstance() {
        return new RecordStep6Fragment();
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
        recordsViewModel = new ViewModelProvider(this).get(RecordsViewModel.class);
        binding = FragmentRecordStep6Binding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        binding.fragmentRecordStep6ChemicalControlLinearLayout.setVisibility(View.GONE);

        observeViewModel();
        setupListeners(view);
        restoreState();
    }

    private void observeViewModel() {
        recordsViewModel.getActionStatus().observe(getViewLifecycleOwner(), actionStatus -> {
            if (actionStatus.equalsIgnoreCase("Actions Completed")) {
                binding.fragmentRecordStep6ActionStatusLinearLayout.setVisibility(View.VISIBLE);
            } else if (actionStatus.equalsIgnoreCase("Pending Actions")) {
                binding.fragmentRecordStep6ActionStatusLinearLayout.setVisibility(View.GONE);
            } else {
                binding.fragmentRecordStep6ActionStatusLinearLayout.setVisibility(View.GONE);
            }
        });
    }

    private void setupListeners(View view) {
        binding.fragmentRecordStep6ActionStatusRadioGroup.setOnCheckedChangeListener(new RadioGroup.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(RadioGroup group, RadioButton checkedButton, int checkedId) {
                if (checkedId == binding.fragmentRecordStep6ActionsCompletedRadioButton.getId()) {
                    recordsViewModel.setActionStatus("Actions Completed");
                }
                else if (checkedId == binding.fragmentRecordStep6PendingActionsRadioButton.getId()) {
                    recordsViewModel.setActionStatus("Pending Actions");
                }
            }
        });

        binding.fragmentRecordStep6ActionTakenChemicalControlCheckbox.setOnCheckedChangeListener(new CheckBox.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CheckBox view, boolean isChecked) {
                if (isChecked)
                    binding.fragmentRecordStep6ChemicalControlLinearLayout.setVisibility(View.VISIBLE);
                else
                    binding.fragmentRecordStep6ChemicalControlLinearLayout.setVisibility(View.GONE);
            }
        });

        binding.fragmentRecordStep6BackButton.setOnClickListener(v ->
                Navigation.findNavController(v).popBackStack()
        );

        binding.fragmentRecordStep6ContinueButton.setOnClickListener(v ->
                {
                    setData();
                    Navigation.findNavController(view)
                            .navigate(R.id.action_record_navigation_record_step_6_to_record_step_7_fragment);
                }
        );
    }

    private void restoreState() {
        if (Data.actionStatus == null) return;

        if (Data.actionStatus.equalsIgnoreCase("Actions Completed"))
            binding.fragmentRecordStep6ActionsCompletedRadioButton.performClick();
        else if (Data.actionStatus.equalsIgnoreCase("Pending Actions"))
            binding.fragmentRecordStep6PendingActionsRadioButton.performClick();

        for (String actionTaken : Data.actionsTaken) {
            FlowLinearLayout flowLinearLayout = binding.fragmentRecordStep6ActionTakenFlowLayout;
            for (int i = 0; i < flowLinearLayout.getChildCount(); i++) {
                CheckBoxOne checkBox = (CheckBoxOne) flowLinearLayout.getChildAt(i);
                if (checkBox.getText().equalsIgnoreCase(actionTaken)) {
                    checkBox.setChecked(true);

                    if (actionTaken.equalsIgnoreCase("Chemical Control"))
                        binding.fragmentRecordStep6ChemicalControlLinearLayout.setVisibility(View.VISIBLE);

                    break;
                }
            }
        }

        binding.fragmentRecordStep6ActionTakenChemicalControlProductNameEditText.setText(Data.chemicalControlProductName);
        binding.fragmentRecordStep6ActionTakenChemicalControlActiveIngredientEditText.setText(Data.chemicalControlActiveIngredient);
        binding.fragmentRecordStep6ActionTakenChemicalControlTreesTreatedEditText.setText(Data.chemicalControlTreesTreated);

        AutoFitGridLayout autoFitGridLayout = binding.fragmentRecordStep6OutcomeGridLayout;
        for (int i = 0; i < autoFitGridLayout.getChildCount(); i++) {
            RadioButtonFour radioButton = (RadioButtonFour) autoFitGridLayout.getChildAt(i);
            if (radioButton.getText().equalsIgnoreCase(Data.outcome)) {
                radioButton.performClick();
                break;
            }
        }

        binding.fragmentRecordStep6RemarksEditText.setText(Data.remarks);
    }

    private void setData() {
        Data.endDate = DateTimeManager.convertEpochToDate2(System.currentTimeMillis());
        Data.actionStatus = binding.fragmentRecordStep6ActionStatusRadioGroup.getCheckedRadioButtonText();
        Data.actionsTaken = getActionTaken();
        Data.chemicalControlProductName = binding.fragmentRecordStep6ActionTakenChemicalControlProductNameEditText.getText().toString();
        Data.chemicalControlActiveIngredient = binding.fragmentRecordStep6ActionTakenChemicalControlActiveIngredientEditText.getText().toString();
        Data.chemicalControlTreesTreated = binding.fragmentRecordStep6ActionTakenChemicalControlTreesTreatedEditText.getText().toString();
        Data.outcome = getOutcome();
        Data.remarks = binding.fragmentRecordStep6RemarksEditText.getText().toString();
    }

    private List<String> getActionTaken() {
        List<String> actionTaken = new ArrayList<>();

        for (int i = 0; i < binding.fragmentRecordStep6ActionTakenFlowLayout.getChildCount(); i++) {
            CheckBox checkBox = (CheckBox) binding.fragmentRecordStep6ActionTakenFlowLayout.getChildAt(i);
            if (checkBox.isChecked()) {
                actionTaken.add(checkBox.getText().toString());
            }
        }

        return actionTaken;
    }

    private String getOutcome() {
        return binding.fragmentRecordStep6OutcomeRadioGroup.getCheckedRadioButtonText();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null; // prevent memory leaks
    }
}
