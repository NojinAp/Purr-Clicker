window.addEventListener("resize", function() {
    const catPic = document.getElementById("catPic");
    if (catPic) catPic.classList.remove("catPic-clicked");
});

window.addEventListener("load", function(event) {

    // ── Flags ──────────────────────────────────────────────────────────────
    let auto1Purchased = false;
    let auto2Purchased = false;
    let auto3Purchased = false;

    // ── DOM refs ───────────────────────────────────────────────────────────
    const catPic       = document.getElementById("catPic");
    const catClickArea = document.getElementById("catClickArea");
    const buttons      = document.querySelectorAll(".option-buttons");
    const help         = document.getElementById("help");
    const closeHelp    = document.getElementById("closeHelp");
    const softBrush    = document.getElementById("clickUpgradeButton1");
    const catnip       = document.getElementById("clickUpgradeButton2");
    const luxScratch   = document.getElementById("clickUpgradeButton3");
    const auto1        = document.getElementById("autoClickerButton1");
    const auto2        = document.getElementById("autoClickerButton2");
    const auto3        = document.getElementById("autoClickerButton3");
    const tooltip      = document.getElementById("badgeTooltip");

    // ── Game state ─────────────────────────────────────────────────────────
    let purrCount   = 0;
    let clickValue  = 1;
    let valueClick1 = 1;
    let valueClick2 = 5;
    let valueClick3 = 10;
    let costClick1  = 50;
    let costClick2  = 120;
    let costClick3  = 300;
    let costAuto1   = 200;
    let costAuto2   = 500;
    let costAuto3   = 1200;
    let autoValue1  = 0;
    let autoValue2  = 0;
    let autoValue3  = 0;

    let intervalID     = null;
    let activeAutoTier = 0;
    let totalUpgrades  = 0;

    // ── 30 Rewards ─────────────────────────────────────────────────────────
    const REWARDS = [
        { id: "rew1",  name: "First Purrs",          type: "purr",    threshold: 75     },
        { id: "rew2",  name: "Getting Warmed Up",    type: "purr",    threshold: 200    },
        { id: "rew3",  name: "Treat Spender",        type: "auto1"                      },
        { id: "rew4",  name: "Purr Collector",       type: "purr",    threshold: 500    },
        { id: "rew5",  name: "Getting Comfy",        type: "purr",    threshold: 1000   },
        { id: "rew6",  name: "Upgrade Starter",      type: "upgrade", threshold: 2      },
        { id: "rew7",  name: "Auto Addict",          type: "auto2"                      },
        { id: "rew8",  name: "Purr Machine",         type: "purr",    threshold: 2500   },
        { id: "rew9",  name: "Speed Demon",          type: "auto3"                      },
        { id: "rew10", name: "Paw Enthusiast",       type: "purr",    threshold: 5000   },
        { id: "rew11", name: "Shop Regular",         type: "upgrade", threshold: 5      },
        { id: "rew12", name: "Purr Mogul",           type: "purr",    threshold: 10000  },
        { id: "rew13", name: "Clicker Elite",        type: "purr",    threshold: 20000  },
        { id: "rew14", name: "Upgrade Baron",        type: "upgrade", threshold: 8      },
        { id: "rew15", name: "Halfway Hero",         type: "purr",    threshold: 35000  },
        { id: "rew16", name: "Purr Tycoon",          type: "purr",    threshold: 50000  },
        { id: "rew17", name: "Upgrade King",         type: "upgrade", threshold: 12     },
        { id: "rew18", name: "Purr Overlord",        type: "purr",    threshold: 75000  },
        { id: "rew19", name: "Power Buyer",          type: "upgrade", threshold: 16     },
        { id: "rew20", name: "Six Figures",          type: "purr",    threshold: 100000 },
        { id: "rew21", name: "Sweet Milestone",      type: "purr",    threshold: 150000 },
        { id: "rew22", name: "Upgrade Veteran",      type: "upgrade", threshold: 20     },
        { id: "rew23", name: "Electric",             type: "purr",    threshold: 250000 },
        { id: "rew24", name: "Blood, Sweat & Purrs", type: "purr",    threshold: 500000 },
        { id: "rew25", name: "Golden Paw",           type: "upgrade", threshold: 25     },
        { id: "rew26", name: "Galaxy Brain",         type: "purr",    threshold: 750000 },
        { id: "rew27", name: "On Fire",              type: "upgrade", threshold: 30     },
        { id: "rew28", name: "Cool Cat",             type: "purr",    threshold: 1000000},
        { id: "rew29", name: "Toxic Levels",         type: "upgrade", threshold: 35     },
        { id: "rew30", name: "Purr Completionist",   type: "purr",    threshold: 2000000},
    ];

    const rewardUnlocked = new Array(REWARDS.length).fill(false);

    // ── Toast queue ────────────────────────────────────────────────────────
    let toastQueue = [];
    let toastBusy  = false;

    function queueRewardMessage(reward) {
        toastQueue.push(reward);
        if (!toastBusy) drainQueue();
    }

    function drainQueue() {
        if (toastQueue.length === 0) { toastBusy = false; return; }
        toastBusy = true;
        const r = toastQueue.shift();

        // Swap badge image to coloured version and mark earned
        const img = document.getElementById(r.id);
        img.src = img.getAttribute("data-color");
        img.setAttribute("data-earned", "true");

        if (r.type === "purr") {
            document.getElementById("countRewardMessageBox").style.visibility = "visible";
            document.getElementById("countBadgeName").textContent = r.name;
            document.getElementById("count").textContent = r.threshold.toLocaleString();
            setTimeout(() => {
                document.getElementById("countRewardMessageBox").style.visibility = "hidden";
                setTimeout(drainQueue, 200);
            }, 1500);

        } else if (r.type === "auto1" || r.type === "auto2" || r.type === "auto3") {
            const autoLabels = { auto1: "Auto Purring I", auto2: "Auto Purring II", auto3: "Auto Purring III" };
            document.getElementById("autoRewardMessageBox").style.visibility = "visible";
            document.getElementById("autoBadgeName").textContent = r.name;
            document.getElementById("autoName").textContent = autoLabels[r.type];
            setTimeout(() => {
                document.getElementById("autoRewardMessageBox").style.visibility = "hidden";
                setTimeout(drainQueue, 200);
            }, 1500);

        } else if (r.type === "upgrade") {
            document.getElementById("upgradeRewardMessageBox").style.visibility = "visible";
            document.getElementById("upgradeBadgeName").textContent = r.name;
            document.getElementById("upgradeCountMsg").textContent = r.threshold;
            setTimeout(() => {
                document.getElementById("upgradeRewardMessageBox").style.visibility = "hidden";
                setTimeout(drainQueue, 200);
            }, 1500);
        }
    }

    function checkRewards() {
        REWARDS.forEach((r, i) => {
            if (rewardUnlocked[i]) return;
            let earned = false;
            if (r.type === "purr"    && purrCount     >= r.threshold) earned = true;
            if (r.type === "upgrade" && totalUpgrades >= r.threshold) earned = true;
            if (r.type === "auto1"   && auto1Purchased)               earned = true;
            if (r.type === "auto2"   && auto2Purchased)               earned = true;
            if (r.type === "auto3"   && auto3Purchased)               earned = true;
            if (earned) {
                rewardUnlocked[i] = true;
                queueRewardMessage(r);
            }
        });
    }

    // ── Badge tooltip ──────────────────────────────────────────────────────
    document.querySelectorAll(".reward-slot").forEach(function(slot) {
        const text = slot.getAttribute("data-tooltip");
        if (!text) return;

        slot.addEventListener("mouseenter", function(e) {
            tooltip.textContent = text;
            tooltip.classList.add("visible");
            positionTooltip(e);
        });
        slot.addEventListener("mousemove", positionTooltip);
        slot.addEventListener("mouseleave", function() {
            tooltip.classList.remove("visible");
        });
    });

    function positionTooltip(e) {
        const gap = 12;
        const tw = tooltip.offsetWidth;
        const th = tooltip.offsetHeight;
        let x = e.clientX + gap;
        let y = e.clientY + gap;
        if (x + tw > window.innerWidth  - 8) x = e.clientX - tw - gap;
        if (y + th > window.innerHeight - 8) y = e.clientY - th - gap;
        tooltip.style.left = x + "px";
        tooltip.style.top  = y + "px";
    }

    // ── Floating +N click effect ───────────────────────────────────────────
    function spawnFloat(e) {
        const rect = catClickArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const el = document.createElement("div");
        el.classList.add("click-float");
        el.textContent = "+" + clickValue;
        // Randomise x a bit so multiple fast clicks don't stack exactly
        el.style.left = (x - 16 + (Math.random() * 24 - 12)) + "px";
        el.style.top  = (y - 10) + "px";
        catClickArea.appendChild(el);
        el.addEventListener("animationend", function() { el.remove(); });
    }

    // ── Auto interval ──────────────────────────────────────────────────────
    function startAutoInterval(tier, ms) {
        clearInterval(intervalID);
        activeAutoTier = tier;
        intervalID = setInterval(function() {
            let gain = clickValue;
            if (tier === 1 && autoValue1 > 1) gain = clickValue * autoValue1;
            if (tier === 2 && autoValue2 > 1) gain = clickValue * autoValue2;
            if (tier === 3 && autoValue3 > 1) gain = clickValue * autoValue3;
            purrCount += gain;
            upgradeScoreboard();
            checkRewards();
        }, ms);
    }

    // ── Auto Purring I ─────────────────────────────────────────────────────
    auto1.addEventListener("click", function() {
        if (purrCount < costAuto1) return;
        purrCount -= costAuto1;
        costAuto1 += 100;
        autoValue1 += 1;
        document.getElementById("autoValue1").textContent = autoValue1 + 1;
        document.getElementById("autoPurringCost1").textContent = costAuto1;
        totalUpgrades += 1;
        if (!auto1Purchased) auto1Purchased = true;
        if (activeAutoTier < 1) startAutoInterval(1, 2000);
        upgradeScoreboard();
        checkRewards();
    });

    // ── Auto Purring II ────────────────────────────────────────────────────
    auto2.addEventListener("click", function() {
        if (purrCount < costAuto2) return;
        purrCount -= costAuto2;
        costAuto2 += 200;
        autoValue2 += 1;
        document.getElementById("autoValue2").textContent = autoValue2 + 1;
        document.getElementById("autoPurringCost2").textContent = costAuto2;
        totalUpgrades += 1;
        if (!auto2Purchased) auto2Purchased = true;
        if (activeAutoTier < 2) startAutoInterval(2, 1000);
        upgradeScoreboard();
        checkRewards();
    });

    // ── Auto Purring III ───────────────────────────────────────────────────
    auto3.addEventListener("click", function() {
        if (purrCount < costAuto3) return;
        purrCount -= costAuto3;
        costAuto3 += 400;
        autoValue3 += 1;
        document.getElementById("autoValue3").textContent = autoValue3 + 1;
        document.getElementById("autoPurringCost3").textContent = costAuto3;
        totalUpgrades += 1;
        if (!auto3Purchased) auto3Purchased = true;
        startAutoInterval(3, 500);
        upgradeScoreboard();
        checkRewards();
    });

    // ── Click upgrades ─────────────────────────────────────────────────────
    softBrush.addEventListener("click", function() {
        if (purrCount < costClick1) return;
        purrCount -= costClick1;
        clickValue += valueClick1;
        valueClick1 *= 2;
        costClick1 += 50;
        document.getElementById("clickUpgradeCost1").textContent = costClick1;
        document.getElementById("clickValue1").textContent = valueClick1;
        totalUpgrades += 1;
        upgradeScoreboard();
        checkRewards();
    });

    catnip.addEventListener("click", function() {
        if (purrCount < costClick2) return;
        purrCount -= costClick2;
        clickValue += valueClick2;
        valueClick2 *= 2;
        costClick2 += 100;
        document.getElementById("clickUpgradeCost2").textContent = costClick2;
        document.getElementById("clickValue2").textContent = valueClick2;
        totalUpgrades += 1;
        upgradeScoreboard();
        checkRewards();
    });

    luxScratch.addEventListener("click", function() {
        if (purrCount < costClick3) return;
        purrCount -= costClick3;
        clickValue += valueClick3;
        valueClick3 *= 2;
        costClick3 += 200;
        document.getElementById("clickUpgradeCost3").textContent = costClick3;
        document.getElementById("clickValue3").textContent = valueClick3;
        totalUpgrades += 1;
        upgradeScoreboard();
        checkRewards();
    });

    // ── Cat click ──────────────────────────────────────────────────────────
    catPic.addEventListener("click", function(e) {
        purrCount += clickValue;
        spawnFloat(e);
        upgradeScoreboard();
        checkRewards();
    });

    catPic.addEventListener("mousedown",  () => catPic.classList.add("catPic-clicked"));
    catPic.addEventListener("mouseup",    () => catPic.classList.remove("catPic-clicked"));
    catPic.addEventListener("mouseleave", () => catPic.classList.remove("catPic-clicked"));

    // ── Button press effect ────────────────────────────────────────────────
    buttons.forEach(function(btn) {
        let origH, origW;
        btn.addEventListener("mousedown", function() {
            origH = btn.offsetHeight;
            origW = btn.offsetWidth;
            btn.style.height = (origH - 5) + "px";
            btn.style.width  = (origW - 5) + "px";
        });
        btn.addEventListener("mouseup", function() {
            if (origH) { btn.style.height = origH + "px"; btn.style.width = origW + "px"; }
        });
        btn.addEventListener("mouseleave", function() {
            if (origH) { btn.style.height = origH + "px"; btn.style.width = origW + "px"; }
        });
    });

    // ── Help ───────────────────────────────────────────────────────────────
    help.addEventListener("click",      () => document.getElementById("helpOverlay").style.visibility = "visible");
    closeHelp.addEventListener("click", () => document.getElementById("helpOverlay").style.visibility = "hidden");

    // ── Scoreboard + affordability ─────────────────────────────────────────
    function upgradeScoreboard() {
        document.getElementById("purrCount").textContent     = purrCount;
        document.getElementById("upgradeCount").textContent  = totalUpgrades;
        document.getElementById("perClickValue").textContent = clickValue;

        const afford = (btn, cost) => {
            btn.style.backgroundColor = purrCount >= cost ? "" : "rgb(200,200,200)";
        };
        afford(softBrush,  costClick1);
        afford(catnip,     costClick2);
        afford(luxScratch, costClick3);
        afford(auto1,      costAuto1);
        afford(auto2,      costAuto2);
        afford(auto3,      costAuto3);
    }

    upgradeScoreboard();
});