using UnityEngine;

public class Follow : MonoBehaviour {

    public GameObject target;
    public float speed = 3;

    float offset;

    void Start()
    {
        offset = transform.position.y - target.transform.position.y;
    }

    void Update () 
    {
        Vector3 targetVec = transform.position;
        targetVec.y = target.transform.position.y + offset;
        targetVec.y = Mathf.Max(targetVec.y, 0);  // don't let it go under the screen

        transform.position = Vector3.MoveTowards(
            transform.position, 
            targetVec,
            speed * Time.deltaTime
        );

    }
}
