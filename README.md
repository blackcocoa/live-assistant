# Live Assistant

ライブ・セットリスト管理 & ストップウォッチアプリ。

---

## Apple Music Developer Token の更新

Developer Token は最大 **180日** で期限切れになります。期限が切れるとプレイリスト作成が失敗するため、以下の手順で再生成してください。

### 必要なもの

| ファイル/情報 | 場所 |
|---|---|
| 秘密鍵（`.p8` ファイル） | Apple Developer Portal でダウンロードしたもの（安全な場所に保管） |
| Key ID | Apple Developer Portal → Keys → 該当キーの詳細 |
| Team ID | Apple Developer Portal → Account → Membership details |

### 手順

**1. トークンを再生成する**

```bash
node generate-apple-token.mjs AuthKey_XXXXXXXX.p8 XXXXXXXX XXXXXXXXXX
#                              ↑ .p8ファイル名       ↑ Key ID  ↑ Team ID
```

**2. `.env.local` を更新する**

出力されたトークンで `.env.local` の値を差し替える：

```
VITE_APPLE_DEVELOPER_TOKEN=eyJhbGc...（新しいトークン）
```

**3. デプロイ先の環境変数も更新する**

GitHub Pages など CI/CD 経由でデプロイしている場合は、リポジトリの **Settings → Secrets and variables → Actions** にある `VITE_APPLE_DEVELOPER_TOKEN` も同様に更新してください。

### 現在のトークンの有効期限を確認する

ターミナルで以下を実行すると期限日時を確認できます（jq が必要）：

```bash
cat .env.local | grep VITE_APPLE_DEVELOPER_TOKEN | cut -d= -f2 | cut -d. -f2 | base64 -d 2>/dev/null | jq '.exp | todate'
```
