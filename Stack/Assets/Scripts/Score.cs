using UnityEngine;
using UnityEngine.UI;

public class Score : MonoBehaviour {

    float _amount;
    public float amount {
        get { return _amount; }
        set {
            _amount = value;
            textComponent.text = amount.ToString("0.00");
        }
    }

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
}
