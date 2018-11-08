﻿using UnityEngine;
using UnityEngine.UI;

public class Score : MonoBehaviour {

    int _amount;
    public int amount {
        get { return _amount; }
        set {
            _amount = value;
            textComponent.text = amount.ToString();
        }
    }

    Text textComponent;

	void Start () 
    {
        textComponent = GetComponent<Text>();
        amount = 0;
	}

    // call from js: gameInstance.SendMessage("Score", "RequestScore");
    public void RequestScore()
    {
        SendScore(); // hard to do it synchronously easily
    }

    // in js: global function receiveScore(amount) { ... }
    void SendScore()
    {
        Application.ExternalCall("receiveScore", amount);
    }
}