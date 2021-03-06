﻿using System;
using UnityEngine;
using UnityEngine.UI;

public class Difficulty : MonoBehaviour
{

    public Vector2 platformSpeedRange = new Vector2(.5f, 5);
    public Vector2 platformDistanceRange = new Vector2(.5f, 2f);

    public float platformSpeed = 3;
    public float platformDistance = 2f;

    int _amount;
    public int amount {
        get { return _amount; }
        set {
            value = Mathf.Clamp(value, 0, 100);
            _amount = value;

            textComponent.text = "Difficulty: " + value;
            platformSpeed    = platformSpeedRange.x +    (platformSpeedRange.y - platformSpeedRange.x)       * (value / 100f);
            platformDistance = platformDistanceRange.x + (platformDistanceRange.y - platformDistanceRange.x) * (value / 100f);
        }
    }

    Text textComponent;

    void Start()
    {
        textComponent = GetComponent<Text>();
        amount = 50;
    }
    
    void FixedUpdate()
    {
        if (Input.GetKeyDown(KeyCode.D))
        {
            Color color = textComponent.color;
            color.a = 1 - color.a;
            textComponent.color = color;
        }

        if (Input.GetKey(KeyCode.UpArrow))
            amount += 1;
        if (Input.GetKey(KeyCode.DownArrow))
            amount -= 1;
    }

    // call from js: gameInstance.SendMessage("Difficulty", "SetDifficulty", 75)
    public void SetDifficulty(int param)
    {
        amount = param;
    }
}
