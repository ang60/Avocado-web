package com.avocado.android.ui.record;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Filter;
import android.widget.Filterable;

import com.avocado.android.R;
import com.avocado.android.data.model.FarmBlock;
import com.avocado.android.databinding.FarmBlockLayoutBinding;
import com.google.android.flexbox.FlexboxLayoutManager;

import java.util.ArrayList;
import java.util.List;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

public class FarmBlockAdapter extends RecyclerView.Adapter<FarmBlockAdapter.ViewHolder> implements Filterable {

    public interface FarmBlockListener {
        void onFarmBlockClick(FarmBlock farmBlock,int position);
    }

    private List<FarmBlock> farmBlockList;
    private List<FarmBlock> farmBlockListFull;
    private final FarmBlockListener farmBlockListener;

    public FarmBlockAdapter(FarmBlockListener farmBlockListener) {
        this.farmBlockList = new ArrayList<>();
        this.farmBlockListFull = new ArrayList<>();
        this.farmBlockListener = farmBlockListener;
    }

    public void setFarmBlockList(List<FarmBlock> farmBlockList) {
        this.farmBlockList = farmBlockList;
        notifyDataSetChanged();
    }

    public void setFarmBlockListFull(List<FarmBlock> farmBlockList) {
        this.farmBlockListFull = new ArrayList<>(farmBlockList);
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        FarmBlockLayoutBinding binding = FarmBlockLayoutBinding.inflate(LayoutInflater.from(parent.getContext()), parent, false);
        return new ViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        holder.bind(position);
    }

    @Override
    public int getItemCount() {
        return farmBlockList.size();
    }

    private FarmBlock getItem(int position) {
        return farmBlockList.get(position);
    }

    public class ViewHolder extends RecyclerView.ViewHolder implements View.OnClickListener {

        FarmBlockLayoutBinding binding;

        ViewHolder(FarmBlockLayoutBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }

        void bind(int position) {
            FarmBlock farmBlock = getItem(position);
            setName(farmBlock.getName());
            setNumberOfTrees(farmBlock.getNumberOfTrees() + " trees");
            setBackground(farmBlock.isSelected() ? R.drawable.layout_background_7 : R.drawable.layout_background_6);
            setClickListener(farmBlock);
        }

        private void setName(String name) {
            binding.farmBlockLayoutNameText.setText(name);
        }

        private void setNumberOfTrees(String numberOfTrees) {
            binding.farmBlockLayoutNumberOfTreesText.setText(numberOfTrees);
        }

        private void setBackground(int drawable) {
            binding.getRoot().setBackgroundResource(drawable);
        }


        private void setClickListener(FarmBlock farmBlock) {
            itemView.setTag(farmBlock);
            itemView.setOnClickListener(this);  //similar to binding.getRoot().setOnClickListener(this);
        }

        @Override
        public void onClick(View view) {
            farmBlockListener.onFarmBlockClick((FarmBlock) view.getTag(), getAbsoluteAdapterPosition());
        }
    }

    @Override
    public Filter getFilter() {
        return formFilter;
    }

    private final Filter formFilter = new Filter() {

        @Override
        protected FilterResults performFiltering(CharSequence constraint) {
            List<FarmBlock> filteredList = new ArrayList<>();

            if (constraint == null || constraint.length() == 0) {
                filteredList.addAll(farmBlockListFull);
            } else {
                String filterPattern = constraint.toString().toLowerCase().trim();

                for (FarmBlock farmBlock : farmBlockListFull) {
                    if (farmBlock.getName().toLowerCase().contains(filterPattern)) {
                        filteredList.add(farmBlock);
                    }
                }
            }

            FilterResults results = new FilterResults();
            results.values = filteredList;
            return results;
        }

        @Override
        protected void publishResults(CharSequence constraint, FilterResults results) {
            farmBlockList.clear();
            farmBlockList.addAll((List<FarmBlock>) results.values);
            notifyDataSetChanged();
        }
    };
}
