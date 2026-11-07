# Described code's share of each game's deals and hint walks

Written by `scripts/checks/deal-profile.test.ts`, which says how to read it.

| Game | Deals | Described | At most | Walks | Described | At most |
| --- | --- | --- | --- | --- | --- | --- |
| abcd | 132 ms | 88.4% | 765% | 34 ms | 15.3% | 18% |
|  | deal: abcd.compiled.ts:satisfied 20.7%; ladder-runtime.ts:rung 14.0%; abcd.compiled.ts:runs 13.0%; describe-runtime.ts:stretch 13.0%; describe-runtime.ts:(anonymous) 6.3%; ladder-runtime.ts:value 5.9% | | | | | |
|  | walk: abcd.compiled.ts:satisfied 4.6%; describe-runtime.ts:stretch 3.1%; ladder-runtime.ts:rung.firings 2.3%; ladder-runtime.ts:CellMarks 2.3%; describe-runtime.ts:clueAt 0.8%; describe-runtime.ts:rangeMask 0.8% | | | | | |
| adjacent | 343 ms | 90.1% | 915% | 252 ms | 12.1% | 14% |
|  | deal: latin.compiled.ts:set 18.7%; adjacent.compiled.ts:adjacentSet 18.1%; latin.compiled.ts:fish 12.0%; latin.compiled.ts:hiddenSingle 6.2%; ladder-runtime.ts:(anonymous) 5.6%; adjacent.compiled.ts:adjacent 5.0% | | | | | |
|  | walk: adjacent.compiled.ts:adjacent 2.1%; latin.compiled.ts:hiddenSingle 1.5%; ladder-runtime.ts:(anonymous) 0.9%; adjacent.compiled.ts:adjacentSet 0.9%; latin.compiled.ts:placed 0.8%; (callee) solver.ts:(anonymous) 0.7% | | | | | |
| blackbox | 34 ms | 81.7% | 446% | 56 ms | 82.6% | 476% |
|  | deal: describe-runtime.ts:look 29.8%; describe-runtime.ts:traceBeam 16.8%; describe-runtime.ts:(anonymous) 13.7%; ladder-runtime.ts:value 3.8%; describe-runtime.ts:gridSpace 2.3%; blackbox.compiled.ts:ray 2.3% | | | | | |
|  | walk: describe-runtime.ts:look 27.9%; describe-runtime.ts:(anonymous) 15.1%; describe-runtime.ts:traceBeam 9.6%; describe-runtime.ts:beam 5.0%; ladder-runtime.ts:known 4.1%; blackbox.compiled.ts:ray 3.2% | | | | | |
| boats | 333 ms | 89.6% | 860% | 95 ms | 82.1% | 458% |
|  | deal: ladder-runtime.ts:rung 15.0%; ladder-runtime.ts:value 8.8%; boats.compiled.ts:onlyFit 8.3%; boats.compiled.ts:lastWater 6.6%; boats.compiled.ts:lastShip 6.3%; describe-runtime.ts:(anonymous) 5.9% | | | | | |
|  | walk: ladder-runtime.ts:value 13.6%; ladder-runtime.ts:rung.firings 9.8%; describe-runtime.ts:stretch 6.5%; boats.compiled.ts:lastShip 6.5%; ladder-runtime.ts:rung 4.6%; boats.compiled.ts:shortRun 3.8% | | | | | |
| bricks | 163 ms | 90.2% | 917% | 13 ms | 68.8% | 220% |
|  | deal: bricks.compiled.ts:undercount 22.6%; bricks.compiled.ts:three 9.8%; bricks.compiled.ts:overcount 8.7%; ladder-runtime.ts:value 8.4%; ladder-runtime.ts:rung 5.8%; bricks.compiled.ts:strandSupport 5.6% | | | | | |
|  | walk: bricks.compiled.ts:undercount 16.7%; bricks.compiled.ts:three 14.6%; bricks.compiled.ts:overcount 8.3%; (callee) deduction-fixpoint.ts:(anonymous) 6.3%; ladder-runtime.ts:value 4.2%; bricks.compiled.ts:isAnswer 2.1% | | | | | |
| clusters | 348 ms | 91.3% | 1043% | 31 ms | 78.8% | 372% |
|  | deal: clusters.compiled.ts:refute 23.0%; ladder-runtime.ts:rung 13.8%; clusters.compiled.ts:broken 13.3%; clusters.compiled.ts:countFull 12.6%; describe-runtime.ts:(anonymous) 4.8%; ladder-runtime.ts:value 4.4% | | | | | |
|  | walk: clusters.compiled.ts:refute 18.6%; describe-runtime.ts:(anonymous) 13.6%; clusters.compiled.ts:broken 9.3%; (callee) deduction-fixpoint.ts:(anonymous) 8.5%; ladder-runtime.ts:value 5.9%; ladder-runtime.ts:known 5.9% | | | | | |
| cube | 1 ms | 0.0% | 0% | 74 ms | 2.5% | 3% |
|  | deal:  | | | | | |
|  | walk: cube.compiled.ts:rollPlay 1.1%; describe-runtime.ts:gridSpace 0.7%; cube.compiled.ts:play 0.4%; cube.compiled.ts:rules 0.4%; describe-runtime.ts:describedSpace 0.0% | | | | | |
| dominosa | 1427 ms | 90.1% | 909% | 474 ms | 93.0% | 1323% |
|  | deal: dominosa.compiled.ts:onlySpot 16.7%; ladder-runtime.ts:rung 12.0%; dominosa.compiled.ts:localDuplicate2 9.0%; describe-runtime.ts:edgeOf 6.1%; dominosa.compiled.ts:mustOverlap 5.4%; describe-runtime.ts:(anonymous) 5.0% | | | | | |
|  | walk: dominosa.compiled.ts:localDuplicate2 14.3%; dominosa.compiled.ts:set 11.0%; (callee) deduction-fixpoint.ts:ask 8.9%; describe-runtime.ts:edgeOf 7.5%; dominosa.compiled.ts:localDuplicate 7.1%; dominosa.compiled.ts:setDoubles 6.5% | | | | | |
| fifteen | 1 ms | 75.0% | 300% | 10 ms | 30.8% | 44% |
|  | deal: describe-runtime.ts:gridSpace 25.0%; fifteen.compiled.ts:rules 25.0%; fifteen.compiled.ts:deadEnd 25.0%; describe-runtime.ts:describedSpace 0.0% | | | | | |
|  | walk: fifteen.compiled.ts:slidePlay 20.5%; fifteen.compiled.ts:play 5.1%; fifteen.compiled.ts:claimWitnesses 2.6%; fifteen.compiled.ts:(anonymous) 2.6%; fifteen.compiled.ts:rules 0.0% | | | | | |
| filling | 4301 ms | 95.6% | 2179% | 349 ms | 89.3% | 833% |
|  | deal: filling.compiled.ts:mustGrow 17.7%; ladder-runtime.ts:value 13.9%; describe-runtime.ts:joinedAcross 10.6%; ladder-runtime.ts:known 9.3%; filling.compiled.ts:tooFar 8.8%; filling.compiled.ts:noRoom 7.8% | | | | | |
|  | walk: ladder-runtime.ts:value 17.0%; filling.compiled.ts:tooFar 10.3%; filling.compiled.ts:noRoom 9.3%; filling.compiled.ts:mustGrow 8.4%; describe-runtime.ts:searchReach 8.0%; filling.compiled.ts:tooBig 7.9% | | | | | |
| flip | 11 ms | 0.0% | 0% | 3 ms | 8.3% | 9% |
|  | deal:  | | | | | |
|  | walk: describe-runtime.ts:describedSpace 8.3% | | | | | |
| flood | 187 ms | 0.0% | 0% | 191 ms | 1.6% | 2% |
|  | deal:  | | | | | |
|  | walk: flood.compiled.ts:fillPlay 0.8%; describe-runtime.ts:(anonymous) 0.4%; describe-runtime.ts:gridSpace 0.1%; flood.compiled.ts:finished 0.1%; flood.compiled.ts:play 0.1%; describe-runtime.ts:describedSpace 0.0% | | | | | |
| galaxies | 499 ms | 45.4% | 83% | 425 ms | 77.7% | 349% |
|  | deal: galaxies.compiled.ts:soleOwner 14.7%; describe-runtime.ts:of 5.6%; describe-runtime.ts:throughWhere 5.2%; galaxies.compiled.ts:isAnswer 5.0%; galaxies.compiled.ts:(anonymous) 4.2%; describe-runtime.ts:(anonymous) 1.6% | | | | | |
|  | walk: galaxies.compiled.ts:soleOwner 26.1%; describe-runtime.ts:throughWhere 11.8%; describe-runtime.ts:of 10.3%; galaxies.compiled.ts:(anonymous) 7.9%; (callee) solver.ts:walk 2.5%; (callee) hint-frontier.ts:takeContinuing 1.9% | | | | | |
| group | 634 ms | 94.7% | 1797% | 250 ms | 26.1% | 35% |
|  | deal: latin.compiled.ts:set 20.0%; latin.compiled.ts:placed 13.1%; ladder-runtime.ts:value 10.2%; latin.compiled.ts:hiddenSingle 9.4%; group.compiled.ts:associativity 6.6%; ladder-runtime.ts:(anonymous) 6.4% | | | | | |
|  | walk: latin.compiled.ts:hiddenSingle 9.1%; ladder-runtime.ts:value 2.9%; latin.compiled.ts:single 2.3%; latin.compiled.ts:placed 2.2%; group.compiled.ts:associativity 1.9%; ladder-runtime.ts:applyFacts 1.3% | | | | | |
| guess | 0 ms | 0.0% | 0% | 54 ms | 22.2% | 28% |
|  | deal:  | | | | | |
|  | walk: guess.compiled.ts:isAnswer 13.3%; describe-runtime.ts:describedSpace 6.9%; ladder-runtime.ts:rung 0.5%; ladder-runtime.ts:applyFacts 0.5%; guess.compiled.ts:blacksAccounted 0.5%; ladder-runtime.ts:describedLadder 0.5% | | | | | |
| inertia | 29 ms | 0.0% | 0% | 272 ms | 3.0% | 3% |
|  | deal:  | | | | | |
|  | walk: inertia.compiled.ts:lost 1.3%; describe-runtime.ts:gridSpace 0.4%; inertia.compiled.ts:slideLegal 0.3%; inertia.compiled.ts:stranded 0.3%; inertia.compiled.ts:play 0.2%; inertia.compiled.ts:slidePlay 0.2% | | | | | |
| keen | 370 ms | 89.4% | 840% | 333 ms | 31.1% | 45% |
|  | deal: keen.compiled.ts:cageLine 24.0%; keen.compiled.ts:cageEasy 23.6%; keen.compiled.ts:cage 20.9%; ladder-runtime.ts:rung 7.4%; latin.compiled.ts:hiddenSingle 2.6%; latin.compiled.ts:set 2.6% | | | | | |
|  | walk: keen.compiled.ts:cage 8.2%; keen.compiled.ts:cageLine 5.0%; latin.compiled.ts:hiddenSingle 3.9%; keen.compiled.ts:cageEasy 2.3%; ladder-runtime.ts:rung 2.0%; latin.compiled.ts:single 1.2% | | | | | |
| lightup | 3239 ms | 94.3% | 1645% | 94 ms | 92.3% | 1207% |
|  | deal: lightup.compiled.ts:darkSet 22.9%; lightup.compiled.ts:square 20.3%; ladder-runtime.ts:rung 19.7%; describe-runtime.ts:clueAt 11.4%; describe-runtime.ts:(anonymous) 5.6%; describe-runtime.ts:stretch 5.0% | | | | | |
|  | walk: lightup.compiled.ts:square 29.0%; lightup.compiled.ts:darkSet 18.3%; ladder-runtime.ts:rung.firings 13.7%; describe-runtime.ts:clueAt 10.9%; describe-runtime.ts:(anonymous) 6.6%; describe-runtime.ts:stretch 4.6% | | | | | |
| magnets | 162 ms | 77.7% | 348% | 55 ms | 28.8% | 41% |
|  | deal: magnets.compiled.ts:single 18.2%; magnets.compiled.ts:count 14.7%; ladder-runtime.ts:rung 5.6%; describe-runtime.ts:(anonymous) 5.6%; ladder-runtime.ts:value 5.1%; ladder-runtime.ts:(anonymous) 4.0% | | | | | |
|  | walk: magnets.compiled.ts:count 7.2%; describe-runtime.ts:(anonymous) 2.9%; (callee) hint.ts:(anonymous) 2.4%; magnets.compiled.ts:single 1.9%; ladder-runtime.ts:value 1.9%; (callee) hint.ts:lineCells 1.4% | | | | | |
| map | 158 ms | 36.4% | 57% | 23 ms | 10.1% | 11% |
|  | deal: map.compiled.ts:placed 7.8%; ladder-runtime.ts:CellMarks 4.4%; map.compiled.ts:lone 4.2%; map.compiled.ts:weigh 4.1%; ladder-runtime.ts:(anonymous) 3.1%; ladder-runtime.ts:known 2.1% | | | | | |
|  | walk: ladder-runtime.ts:rung.firings 3.4%; map.compiled.ts:lone 2.2%; ladder-runtime.ts:known 2.2%; map.compiled.ts:pair 1.1%; map.compiled.ts:weigh 1.1%; map.compiled.ts:isAnswer 0.0% | | | | | |
| mathrax | 289 ms | 97.5% | 3857% | 683 ms | 71.3% | 249% |
|  | deal: mathrax.compiled.ts:clueEasy 40.3%; ladder-runtime.ts:rung 10.5%; mathrax.compiled.ts:clue 8.5%; describe-runtime.ts:clueAt 7.5%; latin.compiled.ts:set 7.3%; describe-runtime.ts:(anonymous) 6.9% | | | | | |
|  | walk: mathrax.compiled.ts:clueEasy 41.4%; ladder-runtime.ts:rung 9.3%; describe-runtime.ts:(anonymous) 5.3%; describe-runtime.ts:clueAt 5.0%; mathrax.compiled.ts:clue 3.3%; latin.compiled.ts:hiddenSingle 1.4% | | | | | |
| mines | 0 ms | 0.0% | 0% | 957 ms | 71.0% | 245% |
|  | deal:  | | | | | |
|  | walk: mines.compiled.ts:count 14.3%; mines.compiled.ts:pair 12.5%; ladder-runtime.ts:rung 8.2%; ladder-runtime.ts:known 6.7%; mines.compiled.ts:alone 6.7%; mines.compiled.ts:region 6.6% | | | | | |
| mosaic | 4926 ms | 95.1% | 1949% | 179 ms | 87.2% | 682% |
|  | deal: mosaic.compiled.ts:compared 30.3%; mosaic.compiled.ts:alone 21.1%; ladder-runtime.ts:value 15.2%; describe-runtime.ts:within 8.2%; ladder-runtime.ts:rung 6.1%; describe-runtime.ts:(anonymous) 4.2% | | | | | |
|  | walk: mosaic.compiled.ts:alone 25.1%; mosaic.compiled.ts:compared 17.9%; ladder-runtime.ts:value 16.0%; describe-runtime.ts:within 9.3%; describe-runtime.ts:(anonymous) 5.7%; ladder-runtime.ts:rung.firings 4.3% | | | | | |
| netslide | 2 ms | 0.0% | 0% | 6527 ms | 2.0% | 2% |
|  | deal:  | | | | | |
|  | walk: netslide.compiled.ts:finished 2.0%; netslide.compiled.ts:rules 0.0%; netslide.compiled.ts:slidePlay 0.0% | | | | | |
| numgame | 156 ms | 0.0% | 0% | 447 ms | 0.4% | 0% |
|  | deal:  | | | | | |
|  | walk: numgame.compiled.ts:play 0.1%; numgame.compiled.ts:addPlay 0.1%; describe-runtime.ts:isub 0.1%; numgame.compiled.ts:dividePlay 0.1%; numgame.compiled.ts:subtractPlay 0.0% | | | | | |
| palisade | 3192 ms | 94.6% | 1761% | 91 ms | 57.0% | 132% |
|  | deal: palisade.compiled.ts:numberExhausted 15.2%; palisade.compiled.ts:notTooSmall 12.0%; describe-runtime.ts:edgeOf 11.6%; ladder-runtime.ts:rung 11.4%; palisade.compiled.ts:noDanglingEdges 10.6%; ladder-runtime.ts:(anonymous) 7.2% | | | | | |
|  | walk: ladder-runtime.ts:rung.firings 5.7%; palisade.compiled.ts:notTooSmall 5.7%; ladder-runtime.ts:(anonymous) 5.4%; describe-runtime.ts:edgeOf 5.1%; palisade.compiled.ts:noDanglingEdges 4.3%; palisade.compiled.ts:numberExhausted 3.7% | | | | | |
| path | 3392 ms | 84.9% | 562% | 642 ms | 89.2% | 828% |
|  | deal: path.compiled.ts:lineBreaks 17.7%; describe-runtime.ts:throughWhere 10.8%; describe-runtime.ts:edgeOf 8.0%; describe-runtime.ts:clueAt 5.8%; (callee) deduction-fixpoint.ts:firstFiring 5.5%; path.compiled.ts:ways 5.3% | | | | | |
|  | walk: path.compiled.ts:lineBreaks 16.4%; describe-runtime.ts:throughWhere 8.6%; describe-runtime.ts:edgeOf 7.9%; describe-runtime.ts:clueAt 6.3%; path.compiled.ts:ways 5.6%; ladder-runtime.ts:value 4.8% | | | | | |
| pegs | 6 ms | 0.0% | 0% | 12253 ms | 0.1% | 0% |
|  | deal:  | | | | | |
|  | walk: pegs.compiled.ts:frozen 0.1%; pegs.compiled.ts:jumpPlay 0.0%; pegs.compiled.ts:jumpMoves 0.0%; describe-runtime.ts:describedSpace 0.0%; pegs.compiled.ts:rules 0.0%; pegs.compiled.ts:deadEnd 0.0% | | | | | |
| range | 447 ms | 93.0% | 1325% | 33 ms | 67.5% | 207% |
|  | deal: range.compiled.ts:capped 23.3%; range.compiled.ts:reach 18.6%; ladder-runtime.ts:value 15.9%; describe-runtime.ts:ray 10.8%; describe-runtime.ts:cuts 3.9%; ladder-runtime.ts:rung 3.8% | | | | | |
|  | walk: range.compiled.ts:capped 12.7%; range.compiled.ts:reach 9.5%; (callee) solver.ts:(anonymous) 8.7%; ladder-runtime.ts:value 7.9%; (callee) deduction-fixpoint.ts:continuingFiring 4.8%; describe-runtime.ts:cuts 4.8% | | | | | |
| rect | 6382 ms | 92.3% | 1207% | 166 ms | 85.7% | 598% |
|  | deal: describe-runtime.ts:rectHolds 8.6%; rect.compiled.ts:allowed 8.3%; rect.compiled.ts:starve 7.5%; rect.compiled.ts:fits 6.8%; rect.compiled.ts:near 6.3%; rect.compiled.ts:reachers 5.6% | | | | | |
|  | walk: describe-runtime.ts:rectHolds 13.1%; rect.compiled.ts:starve 8.6%; rect.compiled.ts:overlap 5.9%; describe-runtime.ts:(anonymous) 5.3%; rect.compiled.ts:line 4.0%; ladder-runtime.ts:rung.firings 3.9% | | | | | |
| rome | 183 ms | 77.2% | 339% | 383 ms | 20.6% | 26% |
|  | deal: describe-runtime.ts:chain 25.1%; describe-runtime.ts:(anonymous) 7.5%; describe-runtime.ts:step 7.0%; rome.compiled.ts:loop 4.8%; rome.compiled.ts:domainOf 4.6%; ladder-runtime.ts:(anonymous) 3.9% | | | | | |
|  | walk: describe-runtime.ts:chain 5.9%; describe-runtime.ts:step 1.8%; describe-runtime.ts:(anonymous) 1.6%; rome.compiled.ts:lone 1.3%; rome.compiled.ts:loop 1.3%; rome.compiled.ts:cull 0.9% | | | | | |
| salad | 850 ms | 81.4% | 436% | 216 ms | 32.5% | 48% |
|  | deal: latin.compiled.ts:placed 12.0%; latin.compiled.ts:set 10.9%; ladder-runtime.ts:(anonymous) 6.6%; ladder-runtime.ts:value 6.4%; latin.compiled.ts:fish 6.3%; latin.compiled.ts:hiddenSingle 6.0% | | | | | |
|  | walk: salad.compiled.ts:border 10.7%; latin.compiled.ts:hiddenSingle 3.5%; ladder-runtime.ts:value 2.5%; latin.compiled.ts:placed 2.2%; ladder-runtime.ts:(anonymous) 2.0%; ladder-runtime.ts:applyFacts 1.3% | | | | | |
| samegame | 44 ms | 0.0% | 0% | 12923 ms | 0.5% | 1% |
|  | deal:  | | | | | |
|  | walk: samegame.compiled.ts:last 0.4%; samegame.compiled.ts:removePlay 0.0%; samegame.compiled.ts:deadEnd 0.0%; samegame.compiled.ts:stuck 0.0%; describe-runtime.ts:gridSpace 0.0%; samegame.compiled.ts:play 0.0% | | | | | |
| seismic | 2693 ms | 2.1% | 2% | 186 ms | 34.1% | 52% |
|  | deal: seismic.compiled.ts:cull 1.0%; seismic.compiled.ts:isAnswer 0.3%; seismic.compiled.ts:lone 0.1%; seismic.compiled.ts:starve 0.1%; ladder-runtime.ts:(anonymous) 0.1%; ladder-runtime.ts:value 0.1% | | | | | |
|  | walk: seismic.compiled.ts:cull 16.2%; seismic.compiled.ts:starve 3.6%; seismic.compiled.ts:lone 3.3%; ladder-runtime.ts:known 1.5%; ladder-runtime.ts:(anonymous) 1.4%; ladder-runtime.ts:CellMarks 1.4% | | | | | |
| separate | 294 ms | 80.8% | 420% | 18 ms | 49.3% | 97% |
|  | deal: separate.compiled.ts:sharedLetter 20.7%; separate.compiled.ts:onlyWay 14.0%; describe-runtime.ts:of 8.7%; separate.compiled.ts:walledApart 7.2%; ladder-runtime.ts:value 5.9%; ladder-runtime.ts:rung 5.1% | | | | | |
|  | walk: separate.compiled.ts:onlyWay 8.5%; describe-runtime.ts:of 7.0%; describe-runtime.ts:clueList 7.0%; (callee) hint-frontier.ts:takeContinuing 5.6%; (callee) deduction-fixpoint.ts:(anonymous) 4.2%; separate.compiled.ts:sharedLetter 4.2% | | | | | |
| singles | 881 ms | 90.8% | 985% | 49 ms | 55.2% | 123% |
|  | deal: singles.compiled.ts:offset 27.2%; ladder-runtime.ts:rung 19.5%; singles.compiled.ts:sameLine 14.7%; describe-runtime.ts:clueAt 6.3%; describe-runtime.ts:(anonymous) 4.8%; singles.compiled.ts:boxedIn 2.9% | | | | | |
|  | walk: singles.compiled.ts:sameLine 13.7%; (callee) deduction-fixpoint.ts:(anonymous) 6.6%; singles.compiled.ts:offset 6.6%; describe-runtime.ts:(anonymous) 5.5%; (callee) hint-frontier.ts:takeContinuing 3.3%; singles.compiled.ts:boxedIn 2.7% | | | | | |
| sixteen | 1 ms | 0.0% | 0% | 5812 ms | 0.0% | 0% |
|  | deal:  | | | | | |
|  | walk:  | | | | | |
| slant | 428 ms | 97.2% | 3443% | 68 ms | 54.7% | 121% |
|  | deal: slant.compiled.ts:clue 22.1%; ladder-runtime.ts:rung 9.4%; slant.compiled.ts:loop 8.4%; describe-runtime.ts:(anonymous) 5.7%; slant.compiled.ts:share 5.6%; slant.compiled.ts:drawn 5.5% | | | | | |
|  | walk: ladder-runtime.ts:rung.firings 5.3%; slant.compiled.ts:clue 4.9%; slant.compiled.ts:deadEnd 4.2%; describe-runtime.ts:(anonymous) 3.8%; slant.compiled.ts:loop 3.8%; slant.compiled.ts:three 3.8% | | | | | |
| slide | 16389 ms | 0.0% | 0% | 293 ms | 1.1% | 1% |
|  | deal:  | | | | | |
|  | walk: slide.compiled.ts:shiftLegal 0.7%; describe-runtime.ts:describedSpace 0.2%; slide.compiled.ts:legal 0.1%; slide.compiled.ts:shiftPlay 0.1%; slide.compiled.ts:play 0.0% | | | | | |
| sokoban | 405 ms | 0.0% | 0% | 11261 ms | 0.1% | 0% |
|  | deal:  | | | | | |
|  | walk: sokoban.compiled.ts:pushLegal 0.1%; sokoban.compiled.ts:legal 0.0%; sokoban.compiled.ts:pushPlay 0.0%; sokoban.compiled.ts:rules 0.0%; sokoban.compiled.ts:finished 0.0%; sokoban.compiled.ts:play 0.0% | | | | | |
| solo | 1324 ms | 66.5% | 199% | 907 ms | 32.6% | 48% |
|  | deal: latin.compiled.ts:set 12.4%; solo.compiled.ts:intersect 9.5%; ladder-runtime.ts:value 6.2%; latin.compiled.ts:placed 5.6%; ladder-runtime.ts:(anonymous) 5.4%; solo.compiled.ts:digitSet 4.3% | | | | | |
|  | walk: solo.compiled.ts:regionRule 4.7%; ladder-runtime.ts:rung 3.8%; solo.compiled.ts:intersect 2.9%; latin.compiled.ts:placed 2.5%; latin.compiled.ts:set 1.9%; solo.compiled.ts:boxSingle 1.8% | | | | | |
| starbattle | 7232 ms | 88.6% | 776% | 188 ms | 87.7% | 710% |
|  | deal: ladder-runtime.ts:rung 19.0%; starbattle.compiled.ts:crowdedLine 14.7%; starbattle.compiled.ts:banded 9.5%; starbattle.compiled.ts:confined 7.7%; ladder-runtime.ts:value 6.9%; starbattle.compiled.ts:neededLine 6.1% | | | | | |
|  | walk: starbattle.compiled.ts:crowdedLine 17.5%; ladder-runtime.ts:rung.firings 15.5%; starbattle.compiled.ts:crowdedRegion 10.0%; starbattle.compiled.ts:confined 8.4%; ladder-runtime.ts:value 6.0%; starbattle.compiled.ts:neededLine 5.6% | | | | | |
| sticks | 2947 ms | 97.7% | 4329% | 71 ms | 89.5% | 855% |
|  | deal: sticks.compiled.ts:twoClues 21.5%; ladder-runtime.ts:rung 20.2%; sticks.compiled.ts:unreachable 14.9%; sticks.compiled.ts:tooLong 14.7%; ladder-runtime.ts:value 8.2%; describe-runtime.ts:stretch 6.6% | | | | | |
|  | walk: sticks.compiled.ts:unreachable 20.2%; sticks.compiled.ts:twoClues 13.7%; sticks.compiled.ts:tooLong 10.1%; (callee) deduction-fixpoint.ts:(anonymous) 9.0%; describe-runtime.ts:stretch 8.7%; ladder-runtime.ts:value 5.4% | | | | | |
| towers | 426 ms | 95.2% | 1966% | 171 ms | 39.8% | 66% |
|  | deal: towers.compiled.ts:arrangement 26.7%; towers.compiled.ts:bounds 20.6%; ladder-runtime.ts:value 7.3%; ladder-runtime.ts:rung 4.5%; latin.compiled.ts:set 4.5%; latin.compiled.ts:hiddenSingle 4.4% | | | | | |
|  | walk: towers.compiled.ts:bounds 12.0%; towers.compiled.ts:arrangement 5.2%; ladder-runtime.ts:value 4.3%; ladder-runtime.ts:rung 2.1%; towers.compiled.ts:facing 1.8%; ladder-runtime.ts:(anonymous) 1.7% | | | | | |
| twiddle | 7 ms | 56.0% | 127% | 8216 ms | 0.1% | 0% |
|  | deal: twiddle.compiled.ts:anticlockwisePlay 32.0%; twiddle.compiled.ts:clockwisePlay 24.0%; twiddle.compiled.ts:play 0.0% | | | | | |
|  | walk: twiddle.compiled.ts:clockwisePlay 0.0%; twiddle.compiled.ts:anticlockwisePlay 0.0%; twiddle.compiled.ts:play 0.0%; describe-runtime.ts:describedSpace 0.0%; position-runtime.ts:moveEffect 0.0%; twiddle.compiled.ts:rules 0.0% | | | | | |
| unequal | 356 ms | 88.5% | 768% | 187 ms | 15.1% | 18% |
|  | deal: latin.compiled.ts:set 27.2%; latin.compiled.ts:fish 12.9%; ladder-runtime.ts:(anonymous) 8.7%; latin.compiled.ts:hiddenSingle 8.4%; unequal.compiled.ts:sign 6.4%; ladder-runtime.ts:value 3.7% | | | | | |
|  | walk: latin.compiled.ts:hiddenSingle 2.1%; latin.compiled.ts:set 1.8%; ladder-runtime.ts:(anonymous) 1.2%; ladder-runtime.ts:value 1.1%; ladder-runtime.ts:applyFacts 0.8%; latin.compiled.ts:placed 0.8% | | | | | |
| unruly | 432 ms | 94.0% | 1555% | 53 ms | 69.8% | 231% |
|  | deal: unruly.compiled.ts:threes 29.2%; ladder-runtime.ts:(anonymous) 19.0%; ladder-runtime.ts:value 15.2%; describe-runtime.ts:setOf 12.4%; unruly.compiled.ts:lastGap 5.4%; ladder-runtime.ts:known 3.7% | | | | | |
|  | walk: unruly.compiled.ts:threes 17.2%; ladder-runtime.ts:(anonymous) 13.5%; ladder-runtime.ts:value 10.4%; describe-runtime.ts:setOf 4.7%; unruly.compiled.ts:lastGap 3.6%; (callee) solver.ts:reads 3.1% | | | | | |
| untangle | 8 ms | 0.0% | 0% | 8000 ms | 0.1% | 0% |
|  | deal:  | | | | | |
|  | walk: untangle.compiled.ts:finished 0.0%; describe-runtime.ts:(anonymous) 0.0%; describe-runtime.ts:imul 0.0%; describe-runtime.ts:isub 0.0%; untangle.compiled.ts:legal 0.0%; describe-runtime.ts:describedSpace 0.0% | | | | | |
