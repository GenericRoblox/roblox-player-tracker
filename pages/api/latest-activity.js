import axios from 'axios';

export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    // Step 1: Get user's latest badge
    const badgeRes = await axios.get(
      `https://badges.roblox.com/v1/users/${userId}/badges?sortOrder=Desc&limit=5`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );

    const latestBadge = badgeRes.data.data[0];

    if (!latestBadge || !latestBadge.awardingUniverse?.id) {
      return res.status(404).json({ error: "No recent badge or game found" });
    }

    // Step 2: Get game info from badge's awarding universe
    const gameId = latestBadge.awardingUniverse.id;
    const gameInfo = await axios.get(
      `https://games.roblox.com/v1/games?universeIds=${gameId}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );

    const game = gameInfo.data.data[0];

    if (!game) {
      return res.status(404).json({ error: "Game not found for universe" });
    }

    // Step 3: Respond with badge + game info
    res.status(200).json({
      userId,
      latestBadge: latestBadge.name,
      badgeAwardedAt: latestBadge.awardedDate,
      gameName: game.name,
      gameLink: `https://www.roblox.com/games/${game.rootPlaceId}`,
    });
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch Roblox data" });
  }
}
