import axios from 'axios';

export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const badgeRes = await axios.get(`https://badges.roblox.com/v1/users/${userId}/badges?sortOrder=Desc&limit=5`);
    const latestBadge = badgeRes.data.data[0];

    if (!latestBadge) {
      return res.status(404).json({ error: "No recent badge found" });
    }

    const gameId = latestBadge.awardingUniverse.id;
    const gameInfo = await axios.get(`https://games.roblox.com/v1/games?universeIds=${gameId}`);
    const game = gameInfo.data.data[0];

    res.status(200).json({
      username: userId,
      latestBadge: latestBadge.name,
      gameName: game.name,
      gameLink: `https://www.roblox.com/games/${game.rootPlaceId}`
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch Roblox data" });
  }
}
