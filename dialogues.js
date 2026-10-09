window.GAME_DIALOGUES = {
  "meta": {
    "title": "破曉學園",
    "subtitle": "受凌者主線劇本資料庫",
    "version": "v0.3",
    "author": "張祐仁、謝佳緯",
    "targetAudience": "國小中高年級（3～6年級）",
    "lastUpdated": "2026-10-05",
    "initialStats": {
      "stress": 50,
      "peer": 30,
      "courage": 40,
      "safety": 35,
      "selfEsteem": 30
    },
    "statLimits": {
      "min": 0,
      "max": 100
    },
    "stressOverloadThreshold": 100,
    "stressOverloadResetValue": 60
  },
  "prologue": [
    "最近，自習課上，你負責記下大聲聊天的同學。",
    "有幾位同學因此被老師提醒。",
    "從那天起，班上有些同學開始不理你，還常常捉弄你。"
  ],
  "nodes": [
    {
      "id": "node1",
      "nodeIndex": 1,
      "day": 1,
      "timeOfDay": "清晨自習",
      "sceneId": "S3",
      "sceneName": "班級教室",
      "triggerType": "auto_after_prologue",
      "intro": [
        {
          "type": "narrative",
          "text": "清晨的校園還有點昏暗。你走進教室，發現座位上有一張嘲笑你的紙條。"
        },
        {
          "type": "narrative",
          "text": "抽屜裡也被塞滿了垃圾。"
        },
        {
          "speaker": "同學甲",
          "text": "哎呀，今天的『特別禮物』，你還滿意嗎？"
        },
        {
          "speaker": "同學甲",
          "text": "自習課那麼愛記名字，現在換你被大家記住了。"
        }
      ],
      "question": {
        "id": "Q1",
        "prompt": "這時候，你會怎麼做？",
        "choices": [
          {
            "letter": "A",
            "text": "（把紙條和垃圾收一收，假裝沒看到，低頭坐好。）",
            "effects": {
              "stress": 8,
              "peer": -2,
              "courage": -4,
              "safety": -4,
              "selfEsteem": -4
            },
            "replies": [
              {
                "speaker": "同學甲",
                "text": "哼，不吭聲就對了。這樣才乖。"
              }
            ],
            "tip": "忍耐也許能暫時避開衝突，但事情不會自己消失。被欺負不是你的錯。",
            "tier": "weak"
          },
          {
            "letter": "B",
            "text": "（先把紙條和抽屜拍照留下來，再想想要告訴誰。）",
            "effects": {
              "stress": -6,
              "peer": 2,
              "courage": 6,
              "safety": 6,
              "selfEsteem": 4
            },
            "replies": [
              {
                "speaker": "同學甲",
                "text": "你在拍什麼？不要亂來喔！"
              }
            ],
            "tip": "留下證據（照片、時間）能幫助大人看清楚發生了什麼事。",
            "tier": "best"
          },
          {
            "letter": "C",
            "text": "（看著同學甲）請你們不要再這樣，我會不舒服。",
            "effects": {
              "stress": 2,
              "peer": -3,
              "courage": 5,
              "safety": -3,
              "selfEsteem": 2
            },
            "replies": [
              {
                "speaker": "同學甲",
                "text": "不舒服？那是你自己的問題吧！"
              },
              {
                "speaker": "旁白",
                "text": "（旁邊有幾個同學笑了起來。）"
              }
            ],
            "tip": "說出感受很勇敢。但對方不願意聽時，也要讓大人知道，才會更安全。",
            "tier": "mid"
          }
        ]
      },
      "next": "node2"
    },
    {
      "id": "node2",
      "nodeIndex": 2,
      "day": 1,
      "timeOfDay": "第一節下課",
      "sceneId": "S4",
      "sceneName": "走廊",
      "triggerType": "auto_exit_classroom",
      "intro": [
        {
          "type": "narrative",
          "text": "下課時，你在走廊被同學甲攔住了。"
        },
        {
          "speaker": "同學甲",
          "text": "我已經跟隔壁班的同學乙說了。放學你最好小心一點。"
        }
      ],
      "question": {
        "id": "Q2",
        "prompt": "你會怎麼做？",
        "choices": [
          {
            "letter": "A",
            "text": "好啊，我才不怕你們，儘管來！",
            "effects": {
              "stress": 9,
              "peer": -4,
              "courage": 2,
              "safety": -6,
              "selfEsteem": -2
            },
            "replies": [
              {
                "speaker": "同學甲",
                "text": "很好，那就看看你有多厲害！"
              }
            ],
            "tip": "逞強會讓衝突變大。保護自己的安全，比爭輸贏重要。",
            "tier": "weak"
          },
          {
            "letter": "B",
            "text": "（不回話，先找一位信任的同學，請對方陪你走回教室。）",
            "effects": {
              "stress": -3,
              "peer": 6,
              "courage": 2,
              "safety": 2,
              "selfEsteem": 0
            },
            "replies": [
              {
                "speaker": "旁白",
                "text": "（同學點點頭，陪你走了一段。你覺得安心了一點。）"
              }
            ],
            "tip": "有人陪伴會更安心。但遇到威脅時，還是要讓大人知道。",
            "tier": "mid"
          },
          {
            "letter": "C",
            "text": "（不回話，轉身去找老師，把剛剛的話說清楚。）",
            "effects": {
              "stress": -7,
              "peer": 3,
              "courage": 6,
              "safety": 7,
              "selfEsteem": 3
            },
            "replies": [
              {
                "speaker": "同學甲",
                "text": "喂，你要去哪裡？"
              },
              {
                "speaker": "旁白",
                "text": "（你沒有回頭。）"
              }
            ],
            "tip": "不理會挑釁、直接找大人，是保護自己的好方法。",
            "tier": "best"
          }
        ]
      },
      "outro": [
        {
          "speaker": "老師",
          "text": "下課後，請來輔導室找老師一下，我們慢慢說，謝謝。"
        }
      ],
      "next": "node3"
    },
    {
      "id": "node3",
      "nodeIndex": 3,
      "day": 1,
      "timeOfDay": "放學前",
      "sceneId": "S6",
      "sceneName": "輔導室",
      "triggerType": "auto_enter_counseling",
      "intro": [
        {
          "speaker": "老師",
          "text": "請坐。老師今天早上巡班，也看到了你桌上的紙條和抽屜。"
        },
        {
          "type": "conditional",
          "condition": "Q1 == 'B'",
          "content": {
            "speaker": "老師",
            "text": "你拍下的照片很清楚，幫了大忙。"
          }
        },
        {
          "speaker": "老師",
          "text": "這不只是惡作劇。你想跟老師說說發生了什麼事嗎？"
        }
      ],
      "question": {
        "id": "Q3",
        "prompt": "你會怎麼回答老師？",
        "choices": [
          {
            "letter": "A",
            "text": "同學們一起不理我、捉弄我，我需要老師幫忙。",
            "effects": {
              "stress": -8,
              "peer": 3,
              "courage": 6,
              "safety": 6,
              "selfEsteem": 6
            },
            "replies": [
              {
                "speaker": "老師",
                "text": "謝謝你願意說。你做得很好，學校會一起處理。"
              }
            ],
            "tip": "清楚說出「發生什麼事」和「需要什麼幫忙」，大人才知道怎麼幫你。",
            "tier": "best"
          },
          {
            "letter": "B",
            "text": "是不是我做錯了？如果我沒有記名字，就不會這樣了……",
            "effects": {
              "stress": 8,
              "peer": -2,
              "courage": -4,
              "safety": 0,
              "selfEsteem": -7
            },
            "replies": [
              {
                "speaker": "老師",
                "text": "看著老師。照規定做事，不是被排擠的理由。這不是你的錯。"
              }
            ],
            "tip": "被欺負時容易怪自己。但錯的是欺負人的行為，不是你。",
            "tier": "weak"
          },
          {
            "letter": "C",
            "text": "可能只是鬧著玩，但我有點不舒服，不知道要不要說。",
            "effects": {
              "stress": -2,
              "peer": 0,
              "courage": 2,
              "safety": 1,
              "selfEsteem": -1
            },
            "replies": [
              {
                "speaker": "老師",
                "text": "讓你不舒服的事，就值得說。老師會陪你慢慢整理。"
              }
            ],
            "tip": "感到不舒服，就是重要的訊號。不用等到「很嚴重」才求助。",
            "tier": "mid"
          }
        ]
      },
      "bridge": [
        {
          "speaker": "老師",
          "text": "還有，老師發現你最近眼睛紅紅的，好像很累。"
        },
        {
          "speaker": "老師",
          "text": "如果願意，可以說說最近的心情。"
        }
      ],
      "subQuestion": {
        "id": "Q4",
        "prompt": "你會怎麼回答？",
        "choices": [
          {
            "letter": "A",
            "text": "我現在還不想說，可以讓我先想一想嗎？",
            "effects": {
              "stress": -2,
              "peer": 0,
              "courage": 0,
              "safety": 2,
              "selfEsteem": 1
            },
            "replies": [
              {
                "speaker": "老師",
                "text": "當然可以，不急。想說的時候，輔導室的門隨時為你開著。"
              }
            ],
            "tip": "需要時間也沒關係。知道「哪裡可以求助」，就是很重要的一步。",
            "tier": "mid"
          },
          {
            "letter": "B",
            "text": "我沒事，真的不用麻煩老師，也不要告訴爸媽。",
            "effects": {
              "stress": 8,
              "peer": -2,
              "courage": -5,
              "safety": -5,
              "selfEsteem": -3
            },
            "replies": [
              {
                "speaker": "老師",
                "text": "你不想讓大家擔心，老師懂。但這件事需要家人知道，我們一起面對。"
              }
            ],
            "tip": "怕麻煩別人很常見。但讓信任的大人知道，你才不用一個人扛。",
            "tier": "weak"
          },
          {
            "letter": "C",
            "text": "我晚上常睡不著，也很怕放學被人堵，不知道怎麼辦。",
            "effects": {
              "stress": -9,
              "peer": 3,
              "courage": 6,
              "safety": 8,
              "selfEsteem": 4
            },
            "replies": [
              {
                "speaker": "老師",
                "text": "謝謝你說出來，這很勇敢。今天放學，老師陪你走到校門口。"
              },
              {
                "speaker": "老師",
                "text": "明天，學務處也會開始保護你的安全。"
              }
            ],
            "tip": "說出自己的感受和害怕，別人才有辦法接住你。",
            "tier": "best"
          }
        ]
      },
      "next": "node4"
    },
    {
      "id": "node4",
      "nodeIndex": 4,
      "day": 2,
      "timeOfDay": "早上",
      "sceneId": "S5",
      "sceneName": "穿堂",
      "triggerType": "auto_enter_entrance_hall",
      "intro": [
        {
          "type": "narrative",
          "text": "隔天早上，你在穿堂聽到兩位同學在聊天。"
        },
        {
          "speaker": "同學丁",
          "text": "你看，那個同學今天還敢來學校耶。"
        },
        {
          "speaker": "同學戊",
          "text": "聽說同學乙中午要去找那個同學。我們離遠一點，免得被牽連。"
        }
      ],
      "question": {
        "id": "Q5",
        "prompt": "你會怎麼做？",
        "choices": [
          {
            "letter": "A",
            "text": "（心裡想）大家都在怪我，我今天不該來上學……",
            "effects": {
              "stress": 9,
              "peer": -5,
              "courage": -3,
              "safety": -3,
              "selfEsteem": -7
            },
            "replies": [
              {
                "speaker": "旁白",
                "text": "（你的肩膀垮了下來，連頭都抬不起來。）"
              },
              {
                "speaker": "同學丁",
                "text": "……我們走吧。"
              }
            ],
            "tip": "聽到這些話很難受。但被排擠不是因為你不好，而是有人選擇了傷人的行為。",
            "tier": "weak"
          },
          {
            "letter": "B",
            "text": "（走過去）我有點怕，可以請你們陪我走到辦公室嗎？",
            "effects": {
              "stress": -5,
              "peer": 7,
              "courage": 6,
              "safety": 3,
              "selfEsteem": 4
            },
            "replies": [
              {
                "speaker": "同學丁",
                "text": "呃……好吧，我陪你走一段。"
              },
              {
                "speaker": "旁白",
                "text": "（你發現，有人願意幫忙，也沒有那麼可怕。）"
              }
            ],
            "tip": "主動請旁人幫忙，有時候會比想像中有用。",
            "tier": "best"
          },
          {
            "letter": "C",
            "text": "（假裝沒聽到，低著頭快步走開。）",
            "effects": {
              "stress": 2,
              "peer": -2,
              "courage": -1,
              "safety": 0,
              "selfEsteem": 0
            },
            "replies": [
              {
                "speaker": "旁白",
                "text": "（你走得很快，心臟怦怦跳。）"
              }
            ],
            "tip": "先離開現場可以保護自己。但別忘了，也要把害怕告訴可以信任的人。",
            "tier": "mid"
          }
        ]
      },
      "next": "node5"
    },
    {
      "id": "node5",
      "nodeIndex": 5,
      "day": 2,
      "timeOfDay": "午休",
      "sceneId": "S4",
      "sceneName": "走廊",
      "triggerType": "auto_reach_corridor_corner",
      "intro": [
        {
          "type": "narrative",
          "text": "午休時間，你在走廊被同學乙擋住了去路。"
        },
        {
          "speaker": "同學乙",
          "text": "你就是那個愛打小報告的？聽說你很愛管閒事？"
        }
      ],
      "question": {
        "id": "Q6",
        "prompt": "你會怎麼做？",
        "choices": [
          {
            "letter": "A",
            "text": "你們才奇怪！少在那邊囂張！",
            "effects": {
              "stress": 9,
              "peer": -3,
              "courage": 2,
              "safety": -7,
              "selfEsteem": 0
            },
            "replies": [
              {
                "speaker": "同學乙",
                "text": "你說什麼？你給我小心一點！"
              }
            ],
            "tip": "用生氣的話回應，可能讓對方更激動。不吵架、先離開，比較安全。",
            "tier": "weak"
          },
          {
            "letter": "B",
            "text": "（低下頭不回答，快步從旁邊走過去。）",
            "effects": {
              "stress": 1,
              "peer": 0,
              "courage": -1,
              "safety": 2,
              "selfEsteem": -2
            },
            "replies": [
              {
                "speaker": "同學乙",
                "text": "喂，站住！"
              },
              {
                "speaker": "旁白",
                "text": "（你沒有回頭，但手心都是汗。）"
              }
            ],
            "tip": "不回應可以避免吵架，但如果對方追上來，就要馬上找大人。",
            "tier": "mid"
          },
          {
            "letter": "C",
            "text": "我不想吵架。（說完就往有老師的地方走。）",
            "effects": {
              "stress": -6,
              "peer": 3,
              "courage": 7,
              "safety": 7,
              "selfEsteem": 5
            },
            "replies": [
              {
                "speaker": "同學乙",
                "text": "喂，我還沒講完！"
              }
            ],
            "tip": "平靜地說出「我不想吵架」，再走向有大人的地方，是很棒的自我保護。",
            "tier": "best"
          }
        ]
      },
      "bridge": [
        {
          "type": "narrative",
          "text": "（同學乙追上來，又擋在你前面。）"
        },
        {
          "speaker": "同學乙",
          "text": "放學我在校門口等你。你自己小心一點。"
        },
        {
          "type": "narrative",
          "text": "（同學乙的口袋裡，露出了一個尖尖的危險物品。）"
        }
      ],
      "subQuestion": {
        "id": "Q7",
        "prompt": "你嚇了一跳。這時候，你會怎麼做？",
        "choices": [
          {
            "letter": "A",
            "text": "（立刻往有大人的地方跑，大聲喊）老師！這裡有人帶危險的東西！",
            "effects": {
              "stress": -8,
              "peer": 3,
              "courage": 8,
              "safety": 9,
              "selfEsteem": 5
            },
            "replies": [
              {
                "speaker": "同學乙",
                "text": "你給我閉嘴！"
              },
              {
                "speaker": "生輔組長",
                "text": "（聽到聲音趕來）手離開口袋！靠牆站好，不要動！"
              }
            ],
            "tip": "看到危險物品，馬上離開並大聲求助。這是最安全的做法。",
            "tier": "best"
          },
          {
            "letter": "B",
            "text": "（小聲說）好，我放學去見你。拜託別動手，我也不告訴老師。",
            "effects": {
              "stress": 10,
              "peer": -4,
              "courage": -6,
              "safety": -9,
              "selfEsteem": -6
            },
            "replies": [
              {
                "speaker": "同學乙",
                "text": "算你識相，放學準時到。"
              },
              {
                "speaker": "旁白",
                "text": "（這時，生輔組長剛好巡堂經過。）"
              },
              {
                "speaker": "生輔組長",
                "text": "你們在做什麼？口袋裡是什麼？拿出來！"
              }
            ],
            "tip": "答應對方的要求，可能讓自己更危險。就算被威脅，也要告訴大人。",
            "tier": "weak"
          },
          {
            "letter": "C",
            "text": "（慢慢往後退，先回教室，再想想要不要說。）",
            "effects": {
              "stress": 3,
              "peer": 0,
              "courage": -2,
              "safety": -3,
              "selfEsteem": -1
            },
            "replies": [
              {
                "speaker": "旁白",
                "text": "（你後退了幾步，同學乙一直盯著你。）"
              },
              {
                "speaker": "旁白",
                "text": "（這時，生輔組長剛好轉過轉角。）"
              },
              {
                "speaker": "生輔組長",
                "text": "同學乙，你的口袋裡是什麼？拿出來！"
              }
            ],
            "tip": "想先離開很自然。但危險的事要馬上讓大人知道，越早越安全。",
            "tier": "mid"
          }
        ]
      },
      "next": "node6"
    },
    {
      "id": "node6",
      "nodeIndex": 6,
      "day": 3,
      "timeOfDay": "白天",
      "sceneId": "S7",
      "sceneName": "學務處",
      "triggerType": "auto_enter_office",
      "intro": [
        {
          "type": "narrative",
          "text": "第三天，學務處裡坐著幾位大人。"
        },
        {
          "speaker": "生輔組長",
          "text": "今天請各位家長來，是因為同學乙帶了不該帶的危險物品。"
        },
        {
          "speaker": "生輔組長",
          "text": "同學甲也長時間排擠、嘲笑同學。學校會依規定處理。"
        },
        {
          "speaker": "同學乙的爸爸",
          "text": "組長，有這麼嚴重嗎？小孩子打打鬧鬧，不是很正常嗎？"
        },
        {
          "speaker": "同學甲的媽媽",
          "text": "我家孩子在家很乖。是不是你自己說話太直接，才讓大家不開心？"
        }
      ],
      "question": {
        "id": "Q8",
        "prompt": "大家都看著你。你會怎麼說？",
        "choices": [
          {
            "letter": "A",
            "text": "難道真的是我的問題嗎……對不起，我會改，請你們不要怪我。",
            "effects": {
              "stress": 9,
              "peer": -3,
              "courage": -5,
              "safety": -2,
              "selfEsteem": -8
            },
            "replies": [
              {
                "speaker": "媽媽",
                "text": "（握住你的手）不要道歉，你沒有做錯事。"
              },
              {
                "speaker": "老師",
                "text": "被欺負不是你的問題，是這些行為不對。"
              }
            ],
            "tip": "被指責時容易懷疑自己。但霸凌是行為的問題，不是被欺負的人的問題。",
            "tier": "weak"
          },
          {
            "letter": "B",
            "text": "我沒有罵人或動手。但被嘲笑、被用東西嚇，我真的很害怕。",
            "effects": {
              "stress": -7,
              "peer": 5,
              "courage": 8,
              "safety": 5,
              "selfEsteem": 8
            },
            "replies": [
              {
                "speaker": "媽媽",
                "text": "說得很好。我們不能接受這樣的說法。"
              },
              {
                "speaker": "同學乙的爸爸",
                "text": "（沉默一下）……還不快跟人家道歉。"
              },
              {
                "speaker": "同學乙",
                "text": "對不起……"
              },
              {
                "speaker": "旁白",
                "text": "（同學甲的媽媽臉色一陣尷尬，輕輕推了同學甲一下。）"
              },
              {
                "speaker": "同學甲",
                "text": "……對不起。"
              }
            ],
            "tip": "用「我」開頭說出事實和感受，更容易讓人聽見。",
            "tier": "best"
          },
          {
            "letter": "C",
            "text": "我說不太出來……可以請老師和媽媽幫我說嗎？",
            "effects": {
              "stress": -4,
              "peer": 0,
              "courage": 2,
              "safety": 4,
              "selfEsteem": 0
            },
            "replies": [
              {
                "speaker": "老師",
                "text": "我來說明這幾天發生的事。"
              },
              {
                "speaker": "媽媽",
                "text": "我們都在這裡，你不用一個人撐。"
              }
            ],
            "tip": "請信任的大人幫忙說明，也是一種勇敢。",
            "tier": "mid"
          }
        ]
      },
      "outro": [
        {
          "speaker": "生輔組長",
          "text": "學校會持續處理，也會繼續關心你的安全。"
        },
        {
          "speaker": "老師",
          "text": "之後我們也會調整班級，並安排輔導，陪你慢慢恢復。"
        }
      ],
      "next": "node7"
    },
    {
      "id": "node7",
      "nodeIndex": 7,
      "day": 4,
      "timeOfDay": "傍晚",
      "sceneId": "S8",
      "sceneName": "家：臥房",
      "triggerType": "auto_after_title_card",
      "intro": [
        {
          "type": "narrative",
          "text": "回到家，你坐在房間裡，覺得很累。"
        },
        {
          "speaker": "媽媽",
          "text": "（輕輕敲門）老師來電說，學校已經安排好處理方式了。"
        },
        {
          "speaker": "媽媽",
          "text": "明天要不要先去見輔導老師或心理師，聊聊心情？"
        }
      ],
      "question": {
        "id": "Q9",
        "prompt": "你會怎麼回答？",
        "choices": [
          {
            "letter": "A",
            "text": "我誰都不想見，反正大家都討厭我，我不想回學校了！",
            "effects": {
              "stress": 9,
              "peer": -6,
              "courage": -6,
              "safety": -2,
              "selfEsteem": -6
            },
            "replies": [
              {
                "speaker": "媽媽",
                "text": "（輕輕坐到你旁邊）你現在很難受，媽媽聽到了。"
              },
              {
                "speaker": "媽媽",
                "text": "我們不急，但媽媽會一直陪著你。"
              }
            ],
            "tip": "覺得「大家都討厭我」，通常是心情太累了。休息之後，再和信任的人聊聊。",
            "tier": "weak"
          },
          {
            "letter": "B",
            "text": "我還不知道要不要去，先讓我一個人待一下。",
            "effects": {
              "stress": 1,
              "peer": -2,
              "courage": -2,
              "safety": 0,
              "selfEsteem": -1
            },
            "replies": [
              {
                "speaker": "媽媽",
                "text": "好，需要的時候叫媽媽。我就在隔壁。"
              }
            ],
            "tip": "需要安靜的時間沒有關係，記得告訴別人你想要什麼。",
            "tier": "mid"
          },
          {
            "letter": "C",
            "text": "我有點怕，但想試試看。媽媽可以陪我去嗎？",
            "effects": {
              "stress": -8,
              "peer": 6,
              "courage": 6,
              "safety": 6,
              "selfEsteem": 6
            },
            "replies": [
              {
                "speaker": "媽媽",
                "text": "好孩子，媽媽一定陪你。我們一步一步慢慢走。"
              }
            ],
            "tip": "說出害怕，同時接受幫助，是照顧自己的好方法。",
            "tier": "best"
          }
        ]
      },
      "next": "node8"
    },
    {
      "id": "node8",
      "nodeIndex": 8,
      "day": 4,
      "timeOfDay": "晚上",
      "sceneId": "S9",
      "sceneName": "家：客廳電話旁",
      "triggerType": "auto_reach_phone",
      "intro": [
        {
          "type": "narrative",
          "text": "晚上，老師打電話來。今天老師來家裡，帶來了同學丙幫你整理的課堂筆記。"
        },
        {
          "speaker": "老師",
          "text": "筆記看完了嗎？同學丙每天放學，都留在辦公室幫你抄重點。"
        },
        {
          "speaker": "老師",
          "text": "明天你的請假就結束了。準備好回學校了嗎？"
        }
      ],
      "question": {
        "id": "Q10",
        "prompt": "你會怎麼回答？",
        "choices": [
          {
            "letter": "A",
            "text": "我會緊張，但想試試看。可以請老師早上陪我進教室嗎？",
            "effects": {
              "stress": -7,
              "peer": 5,
              "courage": 7,
              "safety": 4,
              "selfEsteem": 7
            },
            "replies": [
              {
                "speaker": "老師",
                "text": "太好了！明天早自習，老師在教室門口等你。"
              }
            ],
            "tip": "說出擔心，同時請人陪伴，會讓回去的第一步更有力量。",
            "tier": "best"
          },
          {
            "letter": "B",
            "text": "我還是很害怕。大家會不會在背後笑我？",
            "effects": {
              "stress": 1,
              "peer": 0,
              "courage": -1,
              "safety": 1,
              "selfEsteem": -2
            },
            "replies": [
              {
                "speaker": "老師",
                "text": "會害怕是正常的。你是勇敢站出來保護自己的人，不是弱者。"
              },
              {
                "speaker": "老師",
                "text": "我們一起想辦法，讓你回去時不孤單。"
              }
            ],
            "tip": "害怕不代表不夠勇敢。說出來，就能找到辦法。",
            "tier": "mid"
          },
          {
            "letter": "C",
            "text": "我想再請幾天假，等大家忘記這件事再回去。",
            "effects": {
              "stress": 8,
              "peer": -4,
              "courage": -5,
              "safety": -2,
              "selfEsteem": -5
            },
            "replies": [
              {
                "speaker": "老師",
                "text": "老師懂你想先躲一躲的心情。不過逃開並不會讓害怕消失。"
              },
              {
                "speaker": "老師",
                "text": "我們先試半天，好嗎？我會陪你。"
              }
            ],
            "tip": "休息可以，但一直躲著，害怕反而會變大。有人陪著慢慢回去，會比較容易。",
            "tier": "weak"
          }
        ]
      },
      "next": "node9"
    },
    {
      "id": "node9",
      "nodeIndex": 9,
      "day": 5,
      "timeOfDay": "清晨",
      "sceneId": "S3",
      "sceneName": "班級教室",
      "triggerType": "auto_after_title_card",
      "intro": [
        {
          "type": "narrative",
          "text": "第五天清晨，天快亮了。老師陪著你走到教室門口。"
        },
        {
          "speaker": "同學丙",
          "text": "歡迎回來！快來坐，這幾天的課堂重點，我都整理成這一本筆記了。"
        },
        {
          "type": "narrative",
          "text": "（你翻開筆記，每一頁都寫得好仔細。）"
        },
        {
          "speaker": "同學丙",
          "text": "該說對不起的是我們。以後有事，我們一起想辦法。"
        }
      ],
      "question": {
        "id": "Q11",
        "prompt": "你想對同學丙說什麼？",
        "choices": [
          {
            "letter": "A",
            "text": "謝謝你們。以前的事我還有點難過，但我願意重新開始。",
            "effects": {
              "stress": -8,
              "peer": 8,
              "courage": 7,
              "safety": 4,
              "selfEsteem": 8
            },
            "replies": [
              {
                "speaker": "同學丙",
                "text": "嗯！我們慢慢來。"
              },
              {
                "speaker": "旁白",
                "text": "（教室裡有幾位同學，也對你點了點頭。）"
              }
            ],
            "tip": "承認難過，同時願意往前走，是很大的力量。",
            "tier": "best"
          },
          {
            "letter": "B",
            "text": "謝謝。但我以後只想自己讀書，不想和大家有太多牽扯。",
            "effects": {
              "stress": 8,
              "peer": -7,
              "courage": -2,
              "safety": -1,
              "selfEsteem": -3
            },
            "replies": [
              {
                "speaker": "同學丙",
                "text": "沒關係，你照自己的步調。我們隨時都在。"
              }
            ],
            "tip": "想保護自己很正常。但慢慢找回朋友，會讓心情有更多支持。",
            "tier": "weak"
          },
          {
            "letter": "C",
            "text": "謝謝你的筆記。我想慢慢來，需要的時候再跟你說。",
            "effects": {
              "stress": -3,
              "peer": 2,
              "courage": 0,
              "safety": 1,
              "selfEsteem": 1
            },
            "replies": [
              {
                "speaker": "同學丙",
                "text": "好，沒問題！你想說的時候，隨時找我。"
              }
            ],
            "tip": "按自己的步調來，並讓別人知道你需要什麼，是很好的做法。",
            "tier": "mid"
          }
        ]
      },
      "outro": [
        {
          "type": "narrative",
          "text": "早自習的鐘聲響起。窗外，天空已經亮了起來。"
        },
        {
          "type": "narrative",
          "text": "請穿過操場走到校門口，按 E 離開校園進入結局。"
        }
      ],
      "next": "ending"
    }
  ],
  "stressOverload": {
    "school": {
      "sceneId": "S6",
      "sceneName": "輔導室",
      "banner": "壓力值過高，應立即前往輔導室進行輔導。",
      "dialogues": [
        {
          "speaker": "輔導老師",
          "text": "先坐下來，我們一起慢慢呼吸。"
        },
        {
          "speaker": "輔導老師",
          "text": "吸氣，數到 4……吐氣，數到 6。我們再做兩次。"
        }
      ],
      "breathingExercise": {
        "cycles": 3,
        "inhaleSeconds": 4,
        "exhaleSeconds": 6
      },
      "afterBreathing": [
        {
          "speaker": "輔導老師",
          "text": "感覺有好一點嗎？你已經很努力了。"
        },
        {
          "speaker": "輔導老師",
          "text": "準備好了，就回去把剛才的話說完，好嗎？"
        }
      ],
      "resetStressTo": 60
    },
    "home": {
      "sceneId": [
        "S8",
        "S9"
      ],
      "sceneName": "家（臥房／客廳）",
      "banner": "壓力值過高，先和家人一起休息一下。",
      "dialogues": [
        {
          "speaker": "媽媽",
          "text": "（輕輕握住你的手）深吸一口氣……慢慢數到 4……吐氣，數到 6。跟著媽媽再做兩次。"
        }
      ],
      "breathingExercise": {
        "cycles": 3,
        "inhaleSeconds": 4,
        "exhaleSeconds": 6
      },
      "afterBreathing": [
        {
          "speaker": "媽媽",
          "text": "好一點了嗎？別急，媽媽一直在這裡陪你。"
        },
        {
          "speaker": "媽媽",
          "text": "準備好了，我們再慢慢聊，好嗎？"
        }
      ],
      "resetStressTo": 60
    }
  },
  "endings": {
    "formula": "((100 - stress) + peer + courage + safety + selfEsteem) / 5",
    "tiers": [
      {
        "tier": 1,
        "id": "tier1_microlight",
        "name": "微光",
        "range": [
          0,
          44
        ],
        "sky": "灰藍黎明前",
        "atmosphere": "昏暗、微光透出",
        "text": "天色還有點暗，但你一路走到了這裡，這就是勇氣。遇到困難時，不用一個人扛。老師、家人和輔導室，都是你的後盾。"
      },
      {
        "tier": 2,
        "id": "tier2_dawnlight",
        "name": "曙光",
        "range": [
          45,
          64
        ],
        "sky": "曙光初現",
        "atmosphere": "地平線泛黃、柔和微溫",
        "text": "天邊出現了第一道光。你已經做了很多努力。需要幫忙的時候，記得再試一次：告訴老師或家人。"
      },
      {
        "tier": 3,
        "id": "tier3_sunrise",
        "name": "破曉",
        "range": [
          65,
          100
        ],
        "sky": "日出到晴朗",
        "atmosphere": "明亮溫暖、陽光照拂",
        "text": "天亮了。你說出了心裡的害怕，也找到願意幫忙的人。你並不孤單。以後，你也可以成為陪伴別人的那個人。"
      }
    ],
    "helplines": [
      {
        "name": "教育部校園霸凌投訴專線",
        "phone": "1953"
      },
      {
        "name": "保護專線（兒少保護、家暴）",
        "phone": "113"
      },
      {
        "name": "張老師輔導專線",
        "phone": "1980"
      }
    ]
  }
};
