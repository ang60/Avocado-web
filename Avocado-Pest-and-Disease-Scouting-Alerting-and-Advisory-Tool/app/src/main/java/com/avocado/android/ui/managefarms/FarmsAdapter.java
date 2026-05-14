package com.avocado.android.ui.managefarms;

import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Filter;
import android.widget.Filterable;

import com.avocado.android.R;
import com.avocado.android.data.model.Farm;
import com.avocado.android.data.model.FarmBlock;
import com.avocado.android.databinding.FarmBlockLayoutBinding;
import com.avocado.android.databinding.ManageFarmLayoutBinding;

import java.util.ArrayList;
import java.util.List;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

public class FarmsAdapter extends RecyclerView.Adapter<FarmsAdapter.ViewHolder> implements Filterable {

    public interface FarmListener {
        void onFarmClick(Farm farm, int position);
        void onFarmEditClick(Farm farm, int position);
        void onFarmDeleteClick(Farm farm, int position);
    }

    private List<Farm> farmList;
    private List<Farm> farmListFull;
    private final FarmListener farmListener;

    public FarmsAdapter(FarmListener farmListener) {
        this.farmList = new ArrayList<>();
        this.farmListFull = new ArrayList<>();
        this.farmListener = farmListener;
    }

    public void setFarmList(List<Farm> farmList) {
        this.farmList = farmList;
        notifyDataSetChanged();
    }

    public void setFarmListFull(List<Farm> farmList) {
        this.farmListFull = new ArrayList<>(farmList);
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ManageFarmLayoutBinding binding = ManageFarmLayoutBinding.inflate(LayoutInflater.from(parent.getContext()), parent, false);
        return new ViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        holder.bind(position);
    }

    @Override
    public int getItemCount() {
        return farmList.size();
    }

    private Farm getItem(int position) {
        return farmList.get(position);
    }

    public class ViewHolder extends RecyclerView.ViewHolder implements View.OnClickListener {

        ManageFarmLayoutBinding binding;

        ViewHolder(ManageFarmLayoutBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }

        void bind(int position) {
            Farm farm = getItem(position);
            setName(farm.getFarmName());
            setDetails(farm.getLocation() + " • " + farm.getNumberOfBlocks() + " Blocks • " + farm.getTotalTrees() + " Trees");
            setClickListener(farm);
            setEditClickListener(farm);
            setDeleteClickListener(farm);
        }

        private void setName(String name) {
            binding.manageFarmLayoutTitleTextView.setText(name);
        }

        private void setDetails(String details) {
            binding.manageFarmLayoutSubTitleTextView.setText(details);
        }

        private void setClickListener(Farm farm) {
            itemView.setTag(farm);
            itemView.setOnClickListener(this);  //similar to binding.getRoot().setOnClickListener(this);
        }

        private void setEditClickListener(Farm farm) {
            binding.manageFarmLayoutEditImageView.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    farmListener.onFarmEditClick(farm, getAbsoluteAdapterPosition());
                }
            });
        }

        private void setDeleteClickListener(Farm farm) {
            binding.manageFarmLayoutDeleteImageView.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    farmListener.onFarmDeleteClick(farm, getAbsoluteAdapterPosition());
                }
            });
        }

        @Override
        public void onClick(View view) {
            farmListener.onFarmClick((Farm) view.getTag(), getAbsoluteAdapterPosition());
        }
    }

    @Override
    public Filter getFilter() {
        return formFilter;
    }

    private final Filter formFilter = new Filter() {

        @Override
        protected FilterResults performFiltering(CharSequence constraint) {
            List<Farm> filteredList = new ArrayList<>();

            if (constraint == null || constraint.length() == 0) {
                filteredList.addAll(farmListFull);
            } else {
                String filterPattern = constraint.toString().toLowerCase().trim();

                for (Farm farm : farmListFull) {
                    if (farm.getFarmName().toLowerCase().contains(filterPattern)) {
                        filteredList.add(farm);
                    }
                }
            }

            FilterResults results = new FilterResults();
            results.values = filteredList;
            return results;
        }

        @Override
        protected void publishResults(CharSequence constraint, FilterResults results) {
            farmList.clear();
            farmList.addAll((List<Farm>) results.values);
            notifyDataSetChanged();
        }
    };
}
