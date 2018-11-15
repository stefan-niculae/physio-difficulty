using UnityEngine;
using UnityEngine.UI;

public class Score : MonoBehaviour {

    public Difficulty difficulty;

    float _amount;
    public float amount {
        get { return _amount; }
        set {
            _amount = value;
            textComponent.text = amount.ToString("0.00");
        }
    }

    public float modifier = 1;

    Text textComponent;

	void Start () 
    {
        textComponent = GetComponent<Text>();
        amount = 0;
	}

    // call from js: gameInstance.SendMessage("Score", "RequestScore");
    // in js: global function receiveScore(amount) { ... 
    public void RequestScore()
    {
        Application.ExternalCall("receiveScore", amount);
    }

    public void Increase()
    {
        amount += Mathf.Max(Mathf.Pow(difficulty.amount / 100f, 2), .01f) * modifier;
    }

    // external
    public void SetModifier(float value) {
        modifier = value;
    }
}
