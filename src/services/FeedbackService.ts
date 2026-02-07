import { Feedback } from "../models/ApiModels";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = "Church-Life-Apps";
const REPO_NAME = "SongsV2";

export default class FeedbackService {
  async submit(feedback: Feedback): Promise<void> {
    console.log("Submitting feedback to GitHub repository issues.");
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          title: feedback.title,
          body: `> ${feedback.message}\n\n— ${feedback.from}`,
        }),
      }
    );

    console.log("GitHub API response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("GitHub API Error:", errorData);
      throw new Error("Failed to publish feedback to github.");
    }
  }
}
