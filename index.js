// dotenvを使って、環境変数を読み込む
require("dotenv").config();

// 必要なモジュールを読み込む
var fs = require("fs");
const { Client, GatewayIntentBits } = require("discord.js");
const Discord = require("discord.js");

// Discordクライアントを初期化する
const client = new Discord.Client({
  intents: Object.values(Discord.IntentsBitField.Flags),
});

// OpenAIのAPIキーを設定する
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Discordクライアントが起動すると、一度だけ呼び出される関数を定義する
client.once("ready", () => {
  console.log(`${client.user.tag} Ready`);
});

// Discordクライアントが起動すると、一度だけ呼び出される関数を定義する
client.on("ready", async () => {
  // コマンドを定義する
  const chat = [
    {
      name: "gpt", //質問回答　
      description: "質問したら答えが返ってきます",
      options: [
        {
          type: 3,
          name: "質問",
          description: "質問したい文を入れてください",
          required: true,
        },
      ],
    },
    {
      name: "topic", //話題生成
      description: "話題に困ったら実行してね!",
      options: [
        {
          type: 3,
          name: "ジャンル",
          description: "話したいおおまかなジャンルを入れてください(例:アニメ)",
          required: false,
        },
      ],
    },
    {
      name: "img", //話題生成
      description: "話題に困ったら実行してね!",
      options: [
        {
          type: 3,
          name: "ジャンル",
          description: "出力したいものを書いてください",
          required: false,
        },
      ],
    },
  ];

  // コマンドを登録する
  await client.application.commands.set(chat);
});

// インタラクション（コマンド）が作成されたときに呼び出される関数を定義する
client.on("interactionCreate", async (interaction) => {
  // インタラクションがコマンドでなければ、何もしない
  if (!interaction.isCommand()) return;

  // インタラクションがどのコマンドかを取得する
  const command = interaction.commandName;

  // gptコマンドが呼び出された場合、OpenAIに質問を送信する
  if (command === "gpt") {
    // 質問を取得する
    const question = interaction.options.getString("質問");
    console.log(question); // 質問がコンソールに出力される

    // interactionの返信を遅延する
    await interaction.deferReply();

    // OpenAIに質問を送信し、回答を取得する
    (async () => {
      try {
        const completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "user", content: `${question}` }
          ],
        });
        await interaction.editReply(
          `${question}\n>>${completion.data.choices[0].message.content.trim()}\r\n`
        );
      } catch (error) {
        console.error(error);
        await interaction.editReply(`エラーが発生しました: ${error.message}`);
      }
    })();
  }
  if (command === "topic") {
    const genre = interaction.options.getString("ジャンル");
    // interactionの返信を遅延する
    await interaction.deferReply();

    // 話題生成
    (async () => {
      try {
        const completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: `Discordで盛り上がれる${genre}トピックを一つ、1文出力してください!`,
            },
          ],
        });
        await interaction.editReply(
          `${completion.data.choices[0].message.content.trim()}`
        );
      } catch (error) {
        console.error(error);
        await interaction.editReply(`エラーが発生しました: ${error.message}`);
      }
    })();
  }
});

//Discordクライアントにログイン
client.login(process.env.BOT_TOKEN);