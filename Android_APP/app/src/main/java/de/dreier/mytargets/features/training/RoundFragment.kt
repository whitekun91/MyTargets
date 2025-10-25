/*
 * Copyright (C) 2018 Florian Dreier
 *
 * This file is part of MyTargets.
 *
 * MyTargets is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2
 * as published by the Free Software Foundation.
 *
 * MyTargets is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */

package de.dreier.mytargets.features.training

import android.content.IntentFilter
import androidx.databinding.DataBindingUtil
import android.os.Bundle
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import android.text.InputType
import android.view.*
import com.afollestad.materialdialogs.MaterialDialog
import de.dreier.mytargets.R
import de.dreier.mytargets.app.ApplicationInstance
import de.dreier.mytargets.base.adapters.SimpleListAdapterBase
import de.dreier.mytargets.base.db.EndRepository
import de.dreier.mytargets.base.fragments.EditableListFragmentBase
import de.dreier.mytargets.base.fragments.ItemActionModeCallback
import de.dreier.mytargets.base.fragments.LoaderUICallback
import de.dreier.mytargets.databinding.FragmentListBinding
import de.dreier.mytargets.databinding.ItemEndBinding
import de.dreier.mytargets.features.settings.SettingsManager
import de.dreier.mytargets.shared.models.augmented.AugmentedEnd
import de.dreier.mytargets.shared.models.db.End
import de.dreier.mytargets.shared.models.db.Round
import de.dreier.mytargets.utils.*
import de.dreier.mytargets.utils.MobileWearableClient.Companion.BROADCAST_UPDATE_TRAINING_FROM_REMOTE
import de.dreier.mytargets.utils.multiselector.SelectableViewHolder
import java.util.*

/**
 * Shows all ends of one round
 */
class RoundFragment :
    EditableListFragmentBase<AugmentedEnd, SimpleListAdapterBase<AugmentedEnd>>() {

    private var roundId: Long = 0
    private lateinit var binding: FragmentListBinding
    private var round: Round? = null

    private val roundDAO = ApplicationInstance.db.roundDAO()
    private val endDAO = ApplicationInstance.db.endDAO()
    private val endRepository = EndRepository(endDAO)

    private val updateReceiver = object : MobileWearableClient.EndUpdateReceiver() {

        override fun onUpdate(trainingId: Long, roundId: Long, end: End) {
            if (this@RoundFragment.roundId == roundId) {
                reloadData()
            }
        }
    }

    init {
        itemTypeDelRes = R.plurals.passe_deleted
        actionModeCallback = ItemActionModeCallback(this, selector, R.plurals.passe_selected)
        actionModeCallback?.setEditCallback(this::onEdit)
        actionModeCallback?.setDeleteCallback(this::onDelete)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        LocalBroadcastManager.getInstance(context!!).registerReceiver(
            updateReceiver,
            IntentFilter(BROADCAST_UPDATE_TRAINING_FROM_REMOTE)
        )
    }

    override fun onDestroy() {
        super.onDestroy()
        LocalBroadcastManager.getInstance(context!!).unregisterReceiver(updateReceiver)
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding = DataBindingUtil.inflate(inflater, R.layout.fragment_list, container, false)
        binding.recyclerView.setHasFixedSize(true)
        binding.recyclerView.addItemDecoration(
            DividerItemDecoration(
                context!!,
                R.drawable.full_divider
            )
        )
        adapter = EndAdapter()
        binding.recyclerView.itemAnimator = SlideInItemAnimator()
        binding.recyclerView.adapter = adapter
        binding.fab.visibility = View.GONE
        binding.fab.setOnClickListener {
            navigationController
                .navigateToEditEnd(round!!, binding.recyclerView.adapter!!.itemCount)
                .fromFab(binding.fab)
                .start()
        }

        roundId = arguments!!.getLongOrNull(ROUND_ID) ?:
                throw IllegalStateException("Missing required argument round id!")

        setHasOptionsMenu(true)
        return binding.root
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        ToolbarUtils.showHomeAsUp(this)
    }

    override fun onLoad(args: Bundle?): LoaderUICallback {
        round = roundDAO.loadRound(roundId)
        val ends = endRepository.loadAugmentedEnds(round!!.id)
        val showFab = round!!.maxEndCount == null || ends.size < round!!.maxEndCount!!

        return {
            adapter!!.setList(ends)
            binding.fab.visibility = if (showFab) View.VISIBLE else View.GONE

            ToolbarUtils.setTitle(
                this@RoundFragment,
                String.format(Locale.US, "%s %d", getString(R.string.round), round!!.index + 1)
            )
            ToolbarUtils.setSubtitle(this@RoundFragment, round!!.score.toString())
        }
    }

    override fun onCreateOptionsMenu(menu: Menu?, inflater: MenuInflater) {
        inflater.inflate(R.menu.statistics_scoresheet, menu)
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        when (item.itemId) {
            R.id.action_statistics -> {
                navigationController.navigateToStatistics(listOf(roundId))
                return true
            }
            R.id.action_comment -> {
                MaterialDialog.Builder(context!!)
                    .title(R.string.comment)
                    .inputType(InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_MULTI_LINE)
                    .input("", round!!.comment) { _, input ->
                        round!!.comment = input.toString()
                        roundDAO.updateRound(round!!)
                    }
                    .negativeText(android.R.string.cancel)
                    .show()
                return true
            }
            R.id.action_scoreboard -> {
                navigationController.navigateToScoreboard(round!!.trainingId!!, round!!.id)
                return true
            }
            else -> return super.onOptionsItemSelected(item)
        }
    }

    override fun onSelected(item: AugmentedEnd) {
        navigationController.navigateToEditEnd(round!!, item.end.index)
            .start()
    }

    private fun onEdit(itemId: Long) {
        navigationController.navigateToEditEnd(round!!, adapter!!.getItemById(itemId)!!.end.index)
            .start()
    }

    override fun deleteItem(item: AugmentedEnd): () -> AugmentedEnd {
        endDAO.deleteEnd(item.end)
        return {
            endDAO.insertEnd(item.end, item.images, item.shots)
            item
        }
    }

    private inner class EndAdapter :
        SimpleListAdapterBase<AugmentedEnd>(compareBy { it.end.index }) {

        override fun onCreateViewHolder(parent: ViewGroup): SelectableViewHolder<AugmentedEnd> {
            val itemView = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_end, parent, false)
            return EndViewHolder(itemView)
        }
    }

    private inner class EndViewHolder internal constructor(itemView: View) :
        SelectableViewHolder<AugmentedEnd>(
            itemView,
            selector,
            this@RoundFragment,
            this@RoundFragment
        ) {

        private val binding = ItemEndBinding.bind(itemView)

        override fun bindItem(item: AugmentedEnd) {
            val shots = item.shots
            if (SettingsManager.shouldSortTarget(round!!.target)) {
                shots.sort()
            }
            binding.shoots.setShots(round!!.target, shots)
            binding.imageIndicator.visibility =
                    if (item.images.isEmpty()) View.INVISIBLE else View.VISIBLE
            binding.end.text = getString(R.string.end_n, item.end.index + 1)
            binding.endDetails.text = item.end.score.format(
                Utils.getCurrentLocale(context!!),
                SettingsManager.scoreConfiguration
            )
        }
    }

    companion object {
        const val ROUND_ID = "round_id"
    }
}
