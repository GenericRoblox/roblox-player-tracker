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
    const validBadge = badges.find(b => b.awarder?.type === "Place" && b.awarder?.id);

    if (!validBadge) {
      return res.status(404).json({
        error: "No recent badges tied to a place/game found."
      });
    }

    const placeId = validBadge.awarder.id;

    const placeInfo = await axios.get(
      `https://games.roblox.com/v1/games/multiget-place-details?placeIds=${placeId}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );

    const place = placeInfo.data[0];

    if (!place) {
      return res.status(404).json({ error: "Place not found for badge" });
    }

    res.status(200).json({
      userId,
      latestBadge: validBadge.name,
      badgeAwardedAt: validBadge.awardedDate,
      gameName: place.name,
      gameLink: `https://www.roblox.com/games/${place.placeId}`
    });

  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch Roblox data" });
  }
}
