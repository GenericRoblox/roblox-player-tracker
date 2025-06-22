import axios from 'axios';

export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const badgeRes = await axios.get(
      `https://badges.roblox.com/v1/users/${userId}/badges?sortOrder=Desc&limit=100`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );

    const badges = badgeRes.data.data;

    // ✅ Look for the first badge with a valid awardingUniverse
    const validBadge = badges.find(b => b.awardingUniverse?.id);

    if (!validBadge) {
      return res.status(404).json({
        error: "This user has recent badges, but none are linked to a game. Try another user."
      });
    }

    const gameId = validBadge.awardingUniverse.id;

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
      return res.status(404).json({ error: "Game not found for badge universe" });
    }

    res.status(200).json({
      userId,
      latestBadge: validBadge.name,
      badgeAwardedAt: validBadge.awardedDate,
      gameName: game.name,
      gameLink: `https://www.roblox.com/games/${game.rootPlaceId}`
    });

  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch Roblox data" });
  }
}
