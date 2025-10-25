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

import android.app.Activity
import android.app.Instrumentation
import android.content.Intent
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.intent.Intents.intended
import androidx.test.espresso.intent.Intents.intending
import androidx.test.espresso.intent.matcher.IntentMatchers.*
import androidx.test.espresso.intent.rule.IntentsTestRule
import androidx.test.espresso.matcher.ViewMatchers.isDisplayed
import androidx.test.espresso.matcher.ViewMatchers.withText
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.preference.PreferenceFragmentCompat
import de.dreier.mytargets.R
import de.dreier.mytargets.app.ApplicationInstance
import de.dreier.mytargets.features.scoreboard.ScoreboardActivity
import de.dreier.mytargets.features.settings.ESettingsScreens
import de.dreier.mytargets.features.settings.SettingsActivity
import de.dreier.mytargets.shared.models.db.Training
import de.dreier.mytargets.test.base.UITestBase
import de.dreier.mytargets.test.utils.matchers.IntentMatcher.hasClass
import de.dreier.mytargets.test.utils.rules.SimpleDbTestRule
import org.hamcrest.CoreMatchers.*
import org.junit.Rule
import org.junit.Test
import org.junit.rules.RuleChain
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class ScoreboardActivityTest : UITestBase() {

    private val activityTestRule = IntentsTestRule(
            ScoreboardActivity::class.java, true, false)
    @get:Rule
    val rule: RuleChain = RuleChain.outerRule(SimpleDbTestRule())
            .around(activityTestRule)

    @Test
    fun navigation() {
        val trainings = ApplicationInstance.db.trainingDAO().loadTrainings()
        trainings.sortedWith(compareByDescending(Training::date).thenByDescending(Training::id))
        val id = trainings[0].id
        val i = Intent()
        i.putExtra(ScoreboardActivity.TRAINING_ID, id)
        i.putExtra(ScoreboardActivity.ROUND_ID, -1L)
        activityTestRule.launchActivity(i)

        intending(anyOf(not(isInternal()), isInternal()))
                .respondWith(Instrumentation.ActivityResult(Activity.RESULT_OK, null))

        onView(withText(containsString("436/720")))
                .check(matches(isDisplayed()))

        clickActionBarItem(R.id.action_share, R.string.share)
        intended(hasAction(Intent.ACTION_CHOOSER))

        clickActionBarItem(R.id.action_settings, R.string.preferences)
        intended(allOf(hasClass(SettingsActivity::class.java),
                hasExtra(PreferenceFragmentCompat.ARG_PREFERENCE_ROOT, ESettingsScreens.SCOREBOARD.key)))
    }
}
