export function RulesDialog() {
  return (
    <div className="flex flex-col gap-4 mt-2 ml-2 pr-2 text-sm">
      <p>
        Showoff is a game created for cardists to test their skill and knowledge
        in cardistry!
      </p>
      <div>
        <h3 className="font-bold mb-1">Here's how to play Showoff:</h3>
        <ol className="list-decimal ml-4 flex flex-col gap-1">
          <li>
            Each player starts by dealing three cards in front of them. These
            are their "lives".
          </li>
          <li>
            Have each player cut to a random card in the deck. The person with
            the highest-valued card starts first (Aces are high. If you cut to a
            Joker, you get to cut again. Also, if you're using a deck without
            values... then too bad!).
          </li>
          <li>
            On each player's turn, tap/click the 'category'/'next turn' button
            to generate a random category. The player must now perform a move
            from that category to successfully complete their turn.
          </li>
          <li>
            If the player:
            <ul className="list-disc ml-5 flex flex-col gap-1">
              <li>Drops any cards</li>
              <li>
                Repeats a move that has been done by anyone else before in that
                particular game
              </li>
              <li>
                Can't think of any move to perform that fits that category
              </li>
            </ul>
            ...then they remove one of their cards in front of them, losing one
            'life' and ending their turn.
          </li>
          <li>
            The game ends when one player loses all their 'lives', leaving the
            other player as the winner (with all their according bragging
            rights)
          </li>
        </ol>
      </div>
      <div>
        <h3 className="font-bold mb-1">Modifiers</h3>
        <ol className="list-decimal ml-4">
          <li>
            With this optional mode activated, extra challenges are added into
            the game at random in order to raise the stakes.
          </li>
          <li>
            On each turn, there's a chance that the move category will also be
            generated along with a 'modifier' below.
          </li>
          <li>
            If a modifier is added, then the player must fulfill the entire
            challenges's conditions - both the move category WITH the modifier -
            in order to successfully complete their turn. If they fail to do so,
            then that player loses a life.
          </li>
          <li>
            With great risk comes great rewards, of course: if a player
            completes a turn using a modifier, then their opponent loses one
            life, thereby expediting the game.
          </li>
        </ol>
      </div>
      <div>
        <h3 className="font-bold mb-1">Battle Royale</h3>
        <ol className="list-decimal ml-4"></ol>
      </div>
    </div>
  );
}
