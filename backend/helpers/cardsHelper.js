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
      lastDice: true,
    };

    return {
      resultsChanged: true,
      dicesChanged: dicesChanged,
      playerAffected: array[index].id,
      array: newArray,
    };
  },
  // Remove o primeiro dado do oponente
  "02": (array, userId) => {
    // Find oponent index
    const index = array.findIndex((obj) => obj.id !== userId);
    let dicesAffected = array[index].dices[0];

    const newArray = array.map((player) => {
      if (player.id !== userId && player.dices.length > 0) {
        player.dices.shift();
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
  // Remove one even-numbered dice from the opponent
  "03": (array, userId) => {
    // Find opponent index
    const index = array.findIndex((obj) => obj.id !== userId);
    let evenDicesRemoved = [];
    let dicesToRemove = 1;

    const newArray = array.map((player) => {
      if (player.id !== userId) {
        // Remove up to 2 even dice
        player.dices = player.dices.filter((dice) => {
          if (dicesToRemove > 0 && dice % 2 === 0) {
            evenDicesRemoved.push(dice);
            dicesToRemove--;
            return false;
          }
          return true;
        });
      }
      return player;
    });

    const dicesChanged = {
      status: evenDicesRemoved.length > 0,
      dices: evenDicesRemoved,
      playerAffected: array[index].id,
    };

    return {
      resultsChanged: evenDicesRemoved.length > 0,
      dicesChanged: dicesChanged,
      playerAffected: array[index].id,
      array: newArray,
    };
  },
  // Remove one odd-numbered dice from the opponent
  "04": (array, userId) => {
    // Find opponent index
    const index = array.findIndex((obj) => obj.id !== userId);
    let evenDicesRemoved = [];
    let dicesToRemove = 1;

    const newArray = array.map((player) => {
      if (player.id !== userId) {
        // Remove up to 2 even dice
        player.dices = player.dices.filter((dice) => {
          if (dicesToRemove > 0 && dice % 2 !== 0) {
            evenDicesRemoved.push(dice);
            dicesToRemove--;
            return false;
          }
          return true;
        });
      }
      return player;
    });

    const dicesChanged = {
      status: evenDicesRemoved.length > 0,
      dices: evenDicesRemoved,
      playerAffected: array[index].id,
    };

    return {
      resultsChanged: evenDicesRemoved.length > 0,
      dicesChanged: dicesChanged,
      playerAffected: array[index].id,
      array: newArray,
    };
  },
};

module.exports = cardsHelper;
