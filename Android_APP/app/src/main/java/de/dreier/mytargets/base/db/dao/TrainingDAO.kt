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

package de.dreier.mytargets.base.db.dao

import androidx.lifecycle.LiveData
import androidx.room.*
import de.dreier.mytargets.shared.models.db.Round
import de.dreier.mytargets.shared.models.db.Training

@Dao
abstract class TrainingDAO {
    @Query("SELECT * FROM `Training`")
    abstract fun loadTrainings(): List<Training>

    @Query("SELECT * FROM `Training`")
    abstract fun loadTrainingsLive(): LiveData<List<Training>>

    @Query("SELECT * FROM `Training` WHERE `id` = :id")
    abstract fun loadTraining(id: Long): Training

    @Query("SELECT * FROM `Training` WHERE `id` = :id")
    abstract fun loadTrainingLive(id: Long): LiveData<Training>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    abstract fun insertTraining(training: Training): Long

    @Update
    abstract fun updateTraining(training: Training)

    @Query("UPDATE `Training` SET `comment`=:comment WHERE `id` = :trainingId")
    abstract fun updateComment(trainingId: Long, comment: String)

    @Transaction
    open fun insertTraining(training: Training, rounds: List<Round>) {
        training.id = insertTraining(training)
        for (round in rounds) {
            round.trainingId = training.id
            round.id = insertRound(round)
        }
    }

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    abstract fun insertRound(round: Round): Long

    @Delete
    abstract fun deleteTraining(training: Training)
}
