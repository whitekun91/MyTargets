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

package de.dreier.mytargets.features.training.standardround

import android.content.Intent
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions.*
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.contrib.RecyclerViewActions.actionOnItemAtPosition
import androidx.test.espresso.intent.rule.IntentsTestRule
import androidx.test.espresso.matcher.ViewMatchers.*
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.collection.LongSparseArray
import androidx.recyclerview.widget.RecyclerView
import de.dreier.mytargets.R
import de.dreier.mytargets.app.ApplicationInstance
import de.dreier.mytargets.base.navigation.NavigationController
import de.dreier.mytargets.features.settings.SettingsManager
import de.dreier.mytargets.test.base.UITestBase
import de.dreier.mytargets.test.utils.matchers.RecyclerViewMatcher.Companion.withRecyclerView
import org.junit.Before
import org.junit.Ignore
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@Ignore
@RunWith(AndroidJUnit4::class)
class StandardRoundActivityTest : UITestBase() {

    @get:Rule
    var activityTestRule = IntentsTestRule(
            StandardRoundActivity::class.java, true, false)

    @Before
    fun setUp() {
        val map = LongSparseArray<Int>()
        map.put(32L, 3)
        map.put(31L, 2)
        SettingsManager.standardRoundsLastUsed = map
    }

    @Test
    fun searchTest() {
        val i = Intent()
        i.putExtra(NavigationController.ITEM, ApplicationInstance.db.standardRoundDAO().loadStandardRoundOrNull(32L)!!)
        activityTestRule.launchActivity(i)

        clickActionBarItem(R.id.action_search, R.string.search)

        onView(withId(R.id.search_src_text)).perform(replaceText("wa 18"), closeSoftKeyboard())

        onView(withRecyclerView(R.id.recyclerView).atPosition(1))
                .check(matches(hasDescendant(withText(R.string.wa_18_40cm))))

        onView(withRecyclerView(R.id.recyclerView).atPosition(2))
                .check(matches(hasDescendant(withText(R.string.wa_18_60cm))))

        onView(withId(R.id.recyclerView))
                .perform(actionOnItemAtPosition<RecyclerView.ViewHolder>(1, click()))
    }

    @Test
    fun recentlyUsedTest() {
        val i = Intent()
        i.putExtra(NavigationController.ITEM, ApplicationInstance.db.standardRoundDAO().loadStandardRoundOrNull(32L)!!)
        activityTestRule.launchActivity(i)

        onView(withRecyclerView(R.id.recyclerView).atPosition(0))
                .check(matches(hasDescendant(withText(R.string.recently_used))))

        onView(withRecyclerView(R.id.recyclerView).atPosition(1))
                .check(matches(hasDescendant(withText(R.string.wa_standard))))

        onView(withRecyclerView(R.id.recyclerView).atPosition(2))
                .check(matches(hasDescendant(withText(R.string.wa_cub))))

        onView(withRecyclerView(R.id.recyclerView).atPosition(4))
                .check(matches(hasDescendant(withText(R.string.adelaide))))
    }
}
