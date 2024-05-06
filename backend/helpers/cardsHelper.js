const cardsHelper = {
  // Remove o ultimo dado do oponente
  "01": (array, userId) => {
    // Find oponent index
    const index = array.findIndex((obj) => obj.id !== userId);
    let dicesAffected = array[index].dices[array[index].dices.length - 1];

    const newArray = array.map((player) => {
      if (player.id !== userId && player.dices.length > 0) {
        player.dices.pop();
      }
      return player;
    });

    const dicesChanged = {
      status: true,
      dices: [dicesAffected],
      playerAffected: array[index].id,
    };

    return {
      resultsChanged: true,
      dicesChanged: dicesChanged,
      playerAffected: array[index].id,
      array: newArray,
    };
  },
};

module.exports = cardsHelper;
