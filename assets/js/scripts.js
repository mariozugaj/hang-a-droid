hangParts = ['.pole', '.level-beam', '.cross-beam', '.down-beam',
             '.head', '.lant', '.rant', '.body', '.arm', '.leg'];

var movesCheck = null;
guessedLetters = [];

$(document).ready(function () {
  changeDroidOpacity();
  clickLetter();
  guessTheLetter();
  disableEnterOnForms();
  if (window.location.href.match(/new-game\?/)) {
    hideShowSubmitButton();
  }

  if (window.location.href.match(/new\?|new/)) {
    closeModal();
  }
});

function changeDroidOpacity() {
  if (window.location.href.match(/new/)) {
    $.each(hangParts, function (key, value) {
      return $(value).css({
        opacity: '0.2',
      });
    });
  }
};

function parseGuessData(data) {
  var guessed, hangData, lost, moves, secret, win, used;
  hangData = JSON.parse(data);
  moves = hangData.remaining_moves;
  guessed = hangData.guessed_letters;
  win = hangData.win;
  lost = hangData.lost;
  secret = hangData.secret_word;
  used = hangData.used_letters;

  return {
    moves: moves,
    guessed: guessed,
    win: win,
    lost: lost,
    secret: secret,
    used: used,
  };
};

function placeLetter(guessed) {
  var currLetter = [];

  currLetter = guessed.filter(function (ltr) {
    return (guessedLetters.indexOf(ltr) === -1 && ltr !== '');
  });

  guessed.forEach(function (ltr, idx) {
    if (currLetter.indexOf(ltr) !== -1) {
      $('.letter span').eq(idx).html(ltr);
      setTimeout((function () {
        $('.letter--overlay').eq(idx).addClass('hidden');
      }
    ), 300);
      guessedLetters.push(ltr);
    }
  });
};

function hangTheDroid(remainingMoves) {
  var altMoves = [];
  var limit = 9 - remainingMoves;
  movesCheck--;

  for (var i = 0; i <= limit; i++) {
    altMoves.push(i);
  };

  altMoves.forEach(function (idx) {
    $(hangParts[idx]).css({
      opacity: '1',
    }).addClass('spinner');
  });

  $('.remaining_moves span').effect('highlight', {
    color: '#8e44ad',
  });
}

function checkMoves(remainingMoves) {
  $('.remaining_moves span').text(remainingMoves);
  if (remainingMoves < 4) {
    $('.remaining_moves span').css({
      color: 'rgb(149, 46, 46)',
    });
  }

  if (movesCheck >= remainingMoves) {
    return hangTheDroid(remainingMoves);
  }
};

function openModal(msg) {
  modal = document.getElementById('game-over-modal');

  modal.style.display = 'block';
  $('.modal-header h2').text(msg);
};

function gameOverRoutine(state, secret) {
  var i, lostMsg, results, winMsg;
  winMsg = 'You guessed it!!';
  lostMsg = 'You didn\'t guess it';

  if (state.win) {
    setTimeout((function () {
      $('.letter span').addClass('neon_glow');
    }), 800);
    setTimeout((function () {
      openModal(winMsg);
    }), 3000);
  }

  if (state.lost) {
    $('.body').addClass('hanger');
    setTimeout((function () {
      openModal(lostMsg);
    }), 2000);
  }

  if (state.win || state.lost) {
    $('.alphabet__letter').addClass('alphabet__letter--used');
    i = $('.letter').length - 1;
    results = [];
    while (i >= 0) {
      $('.letter span').eq(i).html(secret[i]);
      $('.letter--overlay').eq(i).addClass('hidden');
      results.push(i--);
    }

    return results;
  }
};

function guessTheLetter(letter) {
  if (typeof letter === 'undefined') { letter = ''; }

  return $.ajax('/guess', {
    type: 'POST',
    data: {
      guess: letter,
    },
    success: function (data) {
      var hangData;
      hangData = parseGuessData(data);
      if (movesCheck == null) { movesCheck = hangData.moves; };

      placeLetter(hangData.guessed);
      checkMoves(hangData.moves);
      colorUsedLetters(hangData.used);

      if (hangData.win) {
        return gameOverRoutine({
          win: true,
        }, hangData.secret);
      } else if (hangData.lost) {
        return gameOverRoutine({
          lost: true,
        }, hangData.secret);
      }
    },

  });
};

function disableEnterOnForms() {
  return $(document).on('keyup keypress', 'form input[type="text"]', function (e) {
    if (e.keyCode === 13 || e.keycode === 169) {
      e.preventDefault();
      return false;
    }
  });
};

function hideShowSubmitButton() {
  var textInput = document.getElementById('name-form');
  var timeout = null;
  textInput.onkeyup = function (e) {
    clearTimeout(timeout);
    return timeout = setTimeout((function () {
      if ($.trim($('#name-form').val())) {
        return $('#play').fadeIn(200);
      } else {
        return $('#play').fadeOut(200);
      }
    }), 500);
  };
};

function closeModal() {
  var span, modal;
  modal = document.getElementById('game-over-modal');
  span = $('.modal-close')[0];
  span.onclick = function () {
    modal.style.display = 'none';
  };

  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };
};

function clickLetter() {
  return $('.alphabet__letter span').click(function () {
    letter = $(this).text();
    colorUsedLetters([letter]);
    guessTheLetter(letter);
  });
};

function colorUsedLetters(letters) {
  var alphabet = $('.alphabet__letter span').text().split('');

  letters.forEach(function (letter) {
    $('.alphabet__letter span').eq(alphabet.indexOf(letter)).parent().addClass('alphabet__letter--used');
  });
};
