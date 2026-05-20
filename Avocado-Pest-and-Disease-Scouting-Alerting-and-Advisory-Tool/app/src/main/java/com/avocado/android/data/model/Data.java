package com.avocado.android.data.model;

import java.io.File;
import java.util.List;

public class Data {

    public String farmName;
    public String blockName;
    public String farmerId;
    public String farmId;
    public String blockId;
    public boolean dontKnowVariety;
    public File dontKnowVarietyPhoto;
    public String dontKnowVarietyNote;
    public String variety;
    public String anyTrapsInstalled;
    public List<TrapUse> trapUse;
    public File dontKnowTrapPhoto;
    public File otherTrapPhoto;
    public String anyPestsObserved;
    public List<PestsObserved> pestsObserved;
    public boolean dontKnowPest;
    public File dontKnowPestPhoto;
    public String dontKnowPestNote;
    public List<String> beneficialInsectsObserved;
    public boolean dontKnowBeneficialInsectsObserved;
    public File dontKnowBeneficialInsectsObservedPhoto;
    public String dontKnowBeneficialInsectsObservedNote;
    public String anyDiseasesObserved;
    public List<String> diseases;
    public List<String> otherProductionChallenges;
    public List<String> diseasePlantPart;
    public String diseaseCropStage;
    public String diseaseDetectionMethod;
    public boolean dontKnowDisease;
    public File dontKnowDiseasePhoto;
    public String dontKnowDiseaseNote;
    public String actionStatus;
    public List<String> actionsTaken;
    public String chemicalControlProductName;
    public String chemicalControlActiveIngredient;
    public String chemicalControlTreesTreated;
    public String outcome;
    public String remarks;
    public String startDate;
    public String endDate;
    public String startTimestamp;
    public String endTimestamp;
    public String location;
    public String gpsLatitude;
    public String gpsLongitude;

    public Data() { }
}
