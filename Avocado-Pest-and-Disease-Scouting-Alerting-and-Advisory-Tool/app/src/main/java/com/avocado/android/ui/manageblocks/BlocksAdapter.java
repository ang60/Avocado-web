package com.avocado.android.ui.manageblocks;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Filter;
import android.widget.Filterable;

import com.avocado.android.data.model.Block;
import com.avocado.android.data.model.Farm;
import com.avocado.android.databinding.ManageBlockLayoutBinding;
import com.avocado.android.databinding.ManageFarmLayoutBinding;

import java.util.ArrayList;
import java.util.List;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

public class BlocksAdapter extends RecyclerView.Adapter<BlocksAdapter.ViewHolder> implements Filterable {

    public interface BlockListener {
        void onBlockClick(Block block, int position);
        void onBlockEditClick(Block block, int position);
        void onBlockDeleteClick(Block block, int position);
    }

    private List<Block> blockList;
    private List<Block> blockListFull;
    private final BlockListener blockListener;

    public BlocksAdapter(BlockListener blockListener) {
        this.blockList = new ArrayList<>();
        this.blockListFull = new ArrayList<>();
        this.blockListener = blockListener;
    }

    public void setBlockList(List<Block> blockList) {
        this.blockList = blockList;
        notifyDataSetChanged();
    }

    public void setBlockListFull(List<Block> blockList) {
        this.blockListFull = new ArrayList<>(blockList);
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ManageBlockLayoutBinding binding = ManageBlockLayoutBinding.inflate(LayoutInflater.from(parent.getContext()), parent, false);
        return new ViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        holder.bind(position);
    }

    @Override
    public int getItemCount() {
        return blockList.size();
    }

    private Block getItem(int position) {
        return blockList.get(position);
    }

    public class ViewHolder extends RecyclerView.ViewHolder implements View.OnClickListener {

        ManageBlockLayoutBinding binding;

        ViewHolder(ManageBlockLayoutBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }

        void bind(int position) {
            Block block = getItem(position);
            setName(block.getBlockName());
            setDetails(block.getNumberOfTrees() + " Trees");
            setClickListener(block);
            setEditClickListener(block);
            setDeleteClickListener(block);
        }

        private void setName(String name) {
            binding.manageBlockLayoutNameTextView.setText(name);
        }

        private void setDetails(String details) {
            binding.manageBlockLayoutNumberOfTreesTextView.setText(details);
        }

        private void setClickListener(Block block) {
            itemView.setTag(block);
            itemView.setOnClickListener(this);  //similar to binding.getRoot().setOnClickListener(this);
        }

        private void setEditClickListener(Block block) {
            binding.manageBlockLayoutEditImageView.setTag(block);
            binding.manageBlockLayoutEditImageView.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    blockListener.onBlockEditClick((Block) view.getTag(), getAbsoluteAdapterPosition());
                }
            });
        }

        private void setDeleteClickListener(Block block) {
            binding.manageBlockLayoutDeleteImageView.setTag(block);
            binding.manageBlockLayoutDeleteImageView.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    blockListener.onBlockDeleteClick((Block) view.getTag(), getAbsoluteAdapterPosition());
                }
            });
        }

        @Override
        public void onClick(View view) {
            blockListener.onBlockClick((Block) view.getTag(), getAbsoluteAdapterPosition());
        }
    }

    @Override
    public Filter getFilter() {
        return formFilter;
    }

    private final Filter formFilter = new Filter() {

        @Override
        protected FilterResults performFiltering(CharSequence constraint) {
            List<Block> filteredList = new ArrayList<>();

            if (constraint == null || constraint.length() == 0) {
                filteredList.addAll(blockListFull);
            } else {
                String filterPattern = constraint.toString().toLowerCase().trim();

                for (Block block : blockListFull) {
                    if (block.getBlockName().toLowerCase().contains(filterPattern)) {
                        filteredList.add(block);
                    }
                }
            }

            FilterResults results = new FilterResults();
            results.values = filteredList;
            return results;
        }

        @Override
        protected void publishResults(CharSequence constraint, FilterResults results) {
            blockList.clear();
            blockList.addAll((List<Block>) results.values);
            notifyDataSetChanged();
        }
    };
}
