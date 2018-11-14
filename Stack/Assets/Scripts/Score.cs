using UnityEngine;
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
    // in js: global function receiveScore(amount) { ... 
    public void RequestScore()
    {
        Application.ExternalCall("receiveScore", amount);
    }
}
