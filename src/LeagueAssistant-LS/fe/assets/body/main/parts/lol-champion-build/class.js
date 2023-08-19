class Main_Part_LolChampionBuild extends AppBodyMain_Part {
    static elementURL = "/ui/assets/body/main/parts/lol-champion-build/element.html";

    constructor(container, data, index){
        super(container, data, index);
        this.CreateElement().then(()=>this.Setup());
    }

    Setup = ()=>{
        $(this.element).find(".drop-down-menu").get().forEach((menu)=>window.Widgets.SetupDropDownMenu(menu, this.ReloadContent));
        this.ReloadContent();
    }

    CreateInnerItem = (container, buttons={}, pairItems=0, detailItems=0, statsItems=false)=>{
        let $html = $(`<div></div>`);
        if(Object.keys(buttons).length > 0 || pairItems > 0){
            let $pairItemsEle = $(`<div class="pair-items"></div>`).appendTo($html);
            for(let btn of Object.keys(buttons)){
                $(`<div class="pair-${btn}-button pair-button pair-items-item">
                    <div class="mask hover-pointer action-button"></div>
                </div>`).appendTo($pairItemsEle)
                .find(".action-button").on("click", buttons[btn]);
            }
            for(let i=0; i<pairItems; i++){
                $(`<div class="pair-items-item"></div>`).appendTo($pairItemsEle);
            }
        }
        if(detailItems > 0){
            let $pairDetailEle = $(`<div class="pair-detail"></div>`).appendTo($html);
            for(let i=0; i<detailItems; i++){
                $(`<div class="pair-detail-item"></div>`).appendTo($pairDetailEle);
            }
        }
        if(statsItems){
            let $pairStatsEle = $(`
            <div class="pair-stats">
                <div class="pair-stats-item pair-stats-wr">
                    <div class="mask"></div>
                    <span>51.29%</span>
                </div>
                <div class="pair-stats-item pair-stats-pr">
                    <div class="mask"></div>
                    <span>51.29%</span>
                </div>
            </div>`).appendTo($html);
        }
        return $($html).appendTo(container);
    }

    ReloadContent = ()=>{
        let container;
        let championLowerAlias = this.data["identifier"]["lower-alias"];
        let championPosition = this.data["identifier"]["position"].toLowerCase();
        let gameMode = $(this.element).find(".options-mode .drop-down-menu-selected");
        let rankTier = $(this.element).find(".options-rank .drop-down-menu-selected");

        let requestURL;
        switch(gameMode.attr("data-label")){
            case "aram":
                requestURL = `/opgg/lol/modes/aram/${championLowerAlias}/build?region=global`;
                break;
            case "urf":
                requestURL = `/opgg/lol/modes/urf/${championLowerAlias}/build?region=global`;
                break;
            default:
                requestURL = `/opgg/lol/champions/${championLowerAlias}/${championPosition}/build?region=global&tier=${rankTier.attr("data-label")}`;
                break;
        }
        $.get(requestURL, {}, (pageProps)=>{
            let championId = pageProps["data"]["summary"]["summary"]["id"];
            let championTier = pageProps["data"]["summary"]["summary"]["average_stats"]["tier"];
            $(this.element)
            .find(".champion-icon").attr("data-tier", championTier)
            .find("img").attr("src", `https://cdn.communitydragon.org/latest/champion/${championId}/tile`);

            let championDataPromise = new Promise((resolve, reject)=>{
                let championSummaryRequestURL = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/zh_tw/v1/champions/${championId}.json`;
                $.get(championSummaryRequestURL, {}, (championData)=>{
                    resolve(championData);
                });
            });
            let itemsPromise = new Promise((resolve, reject)=>{
                let items = {};
                let itemsRequestURL = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/zh_tw/v1/items.json";
                $.get(itemsRequestURL, {}, (data)=>{
                    for(let i of data) items[parseInt(i.id)] = i;
                    resolve(items);
                });
            });
            let perksPromise = new Promise((resolve, reject)=>{
                let perks = {};
                let perksRequestURL = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perks.json"
                $.get(perksRequestURL, {}, (data)=>{
                    for(let perk of data) perks[parseInt(perk.id)] = perk;
                    resolve(perks);
                });
            });
            let perkStylesPromise = new Promise((resolve, reject)=>{
                let perkStyles = {};
                let perkStylesRequestURL = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perkstyles.json"
                $.get(perkStylesRequestURL, {}, (data)=>{
                    for(let perkStyle of data["styles"]) perkStyles[parseInt(perkStyle.id)] = perkStyle;
                    resolve(perkStyles);
                });
            });
            let summonerSpellsPromise = new Promise((resolve, reject)=>{
                let summonerSpells = {};
                let summonerSpellsRequestURL = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/summoner-spells.json";
                $.get(summonerSpellsRequestURL, {}, (data)=>{
                    for(let spell of data) summonerSpells[parseInt(spell.id)] = spell;
                    resolve(summonerSpells);
                });
            });
            Promise.all([
                championDataPromise,
                itemsPromise,
                perksPromise,
                perkStylesPromise,
                summonerSpellsPromise,
            ]).then(([
                championData,
                items,
                perks,
                perkStyles,
                summonerSpells,
            ])=>{
                // champion-name
                $(this.element).find(".champion-name span[data-name='champion']").text(championData["name"]);
                $(this.element).find(".champion-name span[data-name='queue']").text(gameMode.text());

                try{ // champion-spells
                    container = $(this.element).find(".champion-spells");
                    container.empty();
                    let dataSpell = pageProps["data"]["summoner_spells"][0];
                    let spellPair = this.CreateInnerItem(container, {}, 2, 0, false);
                    spellPair.addClass("champion-spell-pair");
                    dataSpell["ids"].slice(0, 2).forEach((spellId, index)=>{
                        try{
                            let pairItem = spellPair.find(".pair-items-item");
                            pairItem.addClass("pair-items-1");
                            let src = window.ToCDragonPath(summonerSpells[spellId]["iconPath"]);
                            $(`<img src="${src}" alt="">`).appendTo(pairItem.eq(index));
                        }catch(e){console.log(e)}
                    })
                }catch(e){console.log(e)}
    
                try{ // champion-skills
                    container = $(this.element).find(".champion-skills");
                    container.empty();
                    let dataSkill = pageProps["data"]["skill_masteries"][0];
                    let skillPair = this.CreateInnerItem(
                        container, 
                        {}, 
                        dataSkill["ids"].length, 
                        dataSkill["builds"][0]["order"].slice(0, 15).length, 
                        false
                    );
                    skillPair.addClass("champion-skill-pair");
                    let championSkills = {};
                    championData["spells"].forEach((spell)=>{
                        championSkills[spell["spellKey"].toUpperCase()] = spell;
                    });
                    dataSkill["ids"].forEach((skillId, index)=>{
                        try{
                            let pairItem = skillPair.find(".pair-items-item");
                            pairItem.addClass("pair-items-1");
                            let src = window.ToCDragonPath(championSkills[skillId]["abilityIconPath"]);
                            $(`<img src="${src}" alt=""><span data-skill="${skillId}">${skillId}</span>`)
                            .appendTo(pairItem.eq(index));
                        }catch(e){console.log(e)}
                    });
                    dataSkill["builds"][0]["order"].slice(0, 15).forEach((skillId, index)=>{
                        try{
                            $(`<span data-skill="${skillId}">${skillId}</span>`)
                            .appendTo(skillPair.find(".pair-detail-item").eq(index));
                        }catch(e){console.log(e)}
                    });
                }catch(e){console.log(e)}

                try{ // champion-starters
                    container = $(this.element).find(".champion-starters .sub-block-inner");
                    container.empty();
                    let dataStarters = pageProps["data"]["starter_items"];
                    for(let i=0; i<4; i++){
                        let dataStarter = dataStarters[i];
                        let starters = {"ids": {}, "wr": 0, "pr": 0};
                        dataStarter["ids"].forEach(itemId=>{
                            if(starters["ids"][itemId]===undefined){
                                starters["ids"][itemId] = 1;
                            }else starters["ids"][itemId]++;
                        })
                        starters["wr"] = ((dataStarter["win"]/dataStarter["play"])*100).toFixed(2);
                        starters["pr"] = (dataStarter["pick_rate"]*100).toFixed(2);
                        let startersPair = this.CreateInnerItem(container, {}, Object.keys(starters["ids"]).length, 0, true);
                        startersPair.addClass("champion-build-pair");
                        Object.keys(starters["ids"]).forEach((itemId, index)=>{
                            try{
                                let pairItem = startersPair.find(".pair-items-item").eq(index);
                                pairItem.addClass("pair-items-1");
                                let src = window.ToCDragonPath(items[itemId]["iconPath"]);
                                $(`<img src="${src}" alt="">`).appendTo(pairItem);
                            }catch(e){console.log(e)}
                            if(starters["ids"][itemId] > 1){
                                $(`<span>${starters["ids"][itemId]}</span>`).appendTo(startersPair.find(".pair-items-item").eq(index));
                            }
                        });
                        startersPair.find(".pair-stats-wr span").text(`${starters["wr"]}%`);
                        startersPair.find(".pair-stats-pr span").text(`${starters["pr"]}%`);
                    }
                }catch(e){console.log(e)}

                try{ // champion-boots
                    container = $(this.element).find(".champion-boots .sub-block-inner");
                    container.empty();
                    let dataBoots = pageProps["data"]["boots"];
                    for(let i=0; i<4; i++){
                        let dataBoot = dataBoots[i];
                        let boot = {
                            "id": dataBoot["ids"][0], 
                            "wr": ((dataBoot["win"]/dataBoot["play"])*100).toFixed(2), 
                            "pr": (dataBoot["pick_rate"]*100).toFixed(2)
                        };
                        let bootPair = this.CreateInnerItem(container, {}, 1, 0, true);
                        bootPair.addClass("champion-build-pair");
                        try{
                            let pairItem = bootPair.find(".pair-items-item");
                            pairItem.addClass("pair-items-1");
                            let src = window.ToCDragonPath(items[boot["id"]]["iconPath"]);
                            $(`<img src="${src}" alt="">`).appendTo(pairItem);
                        }catch(e){console.log(e)}
                        bootPair.find(".pair-stats-wr span").text(`${boot["wr"]}%`);
                        bootPair.find(".pair-stats-pr span").text(`${boot["pr"]}%`);
                    }
                }catch(e){console.log(e)}

                let coreItems = [];
                try{ // champion-cores
                    container = $(this.element).find(".champion-cores .sub-block-inner");
                    container.empty();
                    let dataCores = pageProps["data"]["core_items"];
                    for(let i=0; i<4; i++){
                        let dataCore = dataCores[i];
                        let core = {
                            "ids": {}, 
                            "wr": ((dataCore["win"]/dataCore["play"])*100).toFixed(2), 
                            "pr": (dataCore["pick_rate"]*100).toFixed(2)
                        };
                        dataCore["ids"].forEach((itemId, index)=>{
                            core["ids"][itemId] = items[itemId]["description"].includes("rarityMythic")+1;
                        });
                        let corePair = this.CreateInnerItem(container, {}, Object.values(core["ids"]).length, 0, true);
                        corePair.addClass("champion-build-pair");
                        dataCore["ids"].forEach((itemId, index)=>{
                            try{
                                let pairItem = corePair.find(".pair-items-item").eq(index);
                                pairItem.addClass(`pair-items-${core["ids"][itemId]}`);
                                let src = window.ToCDragonPath(items[itemId]["iconPath"]);
                                $(`<img src="${src}" alt="">`).appendTo(pairItem);
                                coreItems.push(itemId);
                            }catch(e){console.log(e)}
                        });
                        corePair.find(".pair-stats-wr span").text(`${core["wr"]}%`);
                        corePair.find(".pair-stats-pr span").text(`${core["pr"]}%`);
                    }
                }catch(e){console.log(e)}

                try{ // champion-items
                    container = $(this.element).find(".champion-items .sub-block-inner");
                    container.empty();
                    let dataItems = pageProps["data"]["last_items"].filter(i=>!coreItems.includes(i["ids"][0]));
                    for(let i=0; i<8; i++){
                        let dataItem = dataItems[i];
                        let item = {
                            "ids": {}, 
                            "wr": ((dataItem["win"]/dataItem["play"])*100).toFixed(2), 
                            "pr": (dataItem["pick_rate"]*100).toFixed(2)
                        };
                        dataItem["ids"].forEach((itemId, index)=>{
                            item["ids"][itemId] = items[itemId]["description"].includes("rarityMythic")+1;
                        });
                        let itemPair = this.CreateInnerItem(container, {}, 1, 0, true);
                        itemPair.addClass("champion-build-pair");
                        dataItem["ids"].forEach((itemId, index)=>{
                            try{
                                let pairItem = itemPair.find(".pair-items-item").eq(index);
                                pairItem.addClass(`pair-items-${item["ids"][itemId]}`);
                                let src = window.ToCDragonPath(items[itemId]["iconPath"]);
                                $(`<img src="${src}" alt="">`).appendTo(pairItem);
                            }catch(e){console.log(e)}
                        });
                        itemPair.find(".pair-stats-wr span").text(`${item["wr"]}%`);
                        itemPair.find(".pair-stats-pr span").text(`${item["pr"]}%`);
                    }
                }catch(e){console.log(e)}

                try{ // champion-runes
                    container = $(this.element).find(".champion-runes .sub-block-inner");
                    container.empty();
                    let dataRunes = pageProps["data"]["rune_pages"];
                    for(let i=0; i<Math.min(dataRunes.length, 4); i++){
                        let dataRune = [
                            [3, 0, dataRunes[i]["builds"][0]["primary_rune_ids"][0]],
                            [1, 0, dataRunes[i]["builds"][0]["primary_rune_ids"][1]],
                            [1, 0, dataRunes[i]["builds"][0]["primary_rune_ids"][2]],
                            [1, 0, dataRunes[i]["builds"][0]["primary_rune_ids"][3]],
                            [0, 1, dataRunes[i]["builds"][0]["secondary_page_id"]],
                            [1, 0, dataRunes[i]["builds"][0]["secondary_rune_ids"][0]],
                            [1, 0, dataRunes[i]["builds"][0]["secondary_rune_ids"][1]],
                            [0, 0, dataRunes[i]["builds"][0]["stat_mod_ids"][0]],
                            [0, 0, dataRunes[i]["builds"][0]["stat_mod_ids"][1]],
                            [0, 0, dataRunes[i]["builds"][0]["stat_mod_ids"][2]],
                        ];
                        let applyFunction = ()=>{
                            console.log("Apply rune")
                            return new Promise((resolve, reject)=>{
                                let currentPageRequestURL = "/riot/lcu/0/lol-perks/v1/currentpage";
                                $.get(currentPageRequestURL, {}, (currentPage)=>resolve(currentPage));
                            }).then((currentPage)=>{
                                return new Promise((resolve, reject)=>{
                                    if(currentPage["success"]){
                                        let deletePageRequestURL = `/riot/lcu/0/lol-perks/v1/pages/${currentPage["response"]["id"]}`;
                                        $.ajax({url: deletePageRequestURL, type: "DELETE"}).always(()=>resolve());
                                    }else resolve()
                                });
                            }).then(()=>{
                                $.post("/riot/lcu/0/lol-perks/v1/pages", JSON.stringify({
                                    "name": `LA - ${championData["name"]}`,
                                    "primaryStyleId": dataRunes[i]["builds"][0]["primary_page_id"],
                                    "subStyleId": dataRunes[i]["builds"][0]["secondary_page_id"],
                                    "selectedPerkIds": [
                                        dataRunes[i]["builds"][0]["primary_rune_ids"][0],
                                        dataRunes[i]["builds"][0]["primary_rune_ids"][1],
                                        dataRunes[i]["builds"][0]["primary_rune_ids"][2],
                                        dataRunes[i]["builds"][0]["primary_rune_ids"][3],
                                        dataRunes[i]["builds"][0]["secondary_rune_ids"][0],
                                        dataRunes[i]["builds"][0]["secondary_rune_ids"][1],
                                        dataRunes[i]["builds"][0]["stat_mod_ids"][0],
                                        dataRunes[i]["builds"][0]["stat_mod_ids"][1],
                                        dataRunes[i]["builds"][0]["stat_mod_ids"][2],
                                    ],
                                    "current": true,
                                }));
                            });
                        }
                        let runePair = this.CreateInnerItem(container, {"apply": applyFunction}, 10, 0, true);
                        runePair.addClass("champion-build-pair");

                        dataRune.forEach((rune, index)=>{
                            try{
                                let pairItem = runePair.find(".pair-items-item").eq(index+1);
                                pairItem.addClass(`pair-items-${rune[0]}`);
                                let src = window.ToCDragonPath(([perks, perkStyles][rune[1]])[rune[2]]["iconPath"]);
                                $(`<img src="${src}" alt="">`).appendTo(pairItem);
                            }catch(e){console.log(e)}
                        });

                        let wr = ((dataRunes[i]["builds"][0]["win"]/dataRunes[i]["builds"][0]["play"])*100).toFixed(2);
                        runePair.find(".pair-stats-wr span").text(`${wr}%`);
                        let pr = (dataRunes[i]["builds"][0]["pick_rate"]*100).toFixed(2);
                        runePair.find(".pair-stats-pr span").text(`${pr}%`);
                    }
                }catch(e){console.log(e)}
            });
        });
    }
}